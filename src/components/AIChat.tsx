import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useSpring, animated, config } from 'react-spring';
import { Save, CloudUpload, Undo, Redo, CheckCircle, Wand  } from 'lucide-react'; 
import Modal from './Modal';
import SavedStories from './SavedStories';
import SaveProjectModal from './SaveProjectModal';

const OPENAI_BACKEND_URL = 'https://new-backend-rileybrown24.replit.app';
const ANTHROPIC_BACKEND_URL = 'https://apprenticechat.replit.app';
const PERPLEXITY_BACKEND_URL = 'https://backend-for-perplexity-RileyBrown24.replit.app';
const LANGUAGE_TOOL_URL = 'https://api.languagetoolplus.com/v2/check';

const fonts = ['Garamond', 'Baskerville', 'Futura', 'Gill Sans', 'Palatino'];

interface AIChatProps {
    content: string;
    onChange: (content: string) => void;
    setIdea: (idea: string) => void;
}

const AIChat: React.FC<AIChatProps> = ({ content, onChange, setIdea }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFont, setSelectedFont] = useState('Gill Sans');
    const [error, setError] = useState<string | null>(null);
    const [predictions, setPredictions] = useState<string[]>([]);
    const [theme, setTheme] = useState('dark');
    const [history, setHistory] = useState<string[]>([]);
    const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
    const quillRef = useRef<ReactQuill>(null);
    const [lastText, setLastText] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [hasGeneratedIdea, setHasGeneratedIdea] = useState(false);

    const buttonSpring = useSpring({ 
        to: { transform: 'scale(1)' }, 
        from: { transform: 'scale(0.95)' }, 
        config: { tension: 300, friction: 10 } 
    });

    const animatedButtonStyle = useSpring({
        to: { opacity: 1, transform: 'translateY(0)' },
        from: { opacity: 0, transform: 'translateY(-10px)' },
        config: config.stiff,
    });

    const loadingSpring = useSpring({
        opacity: isLoading ? 1 : 0,
        config: config.slow,
    });

    const errorSpring = useSpring({
        opacity: error ? 1 : 0,
        config: config.slow,
    });

    const predictionSpring = useSpring({
        opacity: 1,
        from: { opacity: 0 },
        config: config.wobbly,
    });

    const fetchAiResponse = useCallback(async (prompt: string, aiType: 'openai' | 'anthropic' | 'perplexity'): Promise<string> => {
        const backendUrl = {
            'openai': OPENAI_BACKEND_URL,
            'anthropic': ANTHROPIC_BACKEND_URL,
            'perplexity': PERPLEXITY_BACKEND_URL
        }[aiType];

        try {
            const response = await axios.post(`${backendUrl}/api/chat`, { prompt }, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000,
            });
            return response.data.response;
        } catch (error: any) {
            handleError(error);
            throw new Error('Error al obtener la respuesta de IA.');
        }
    }, []);

    const handleLoadStory = (loadedContent: string) => {
        onChange(loadedContent);
        setIsModalOpen(false);
    };

    const handleError = (error: any) => {
        if (error.response) {
            setError(`Error del servidor: ${error.response.status}`);
        } else if (error.request) {
            setError('No se pudo conectar con el servidor.');
        } else {
            setError('Ocurrió un error inesperado.');
        }
    };

    const generateIdea = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const prompt = hasGeneratedIdea 
                ? `Continúa la historia: "${content}"` // Continuar la historia si ya se generó una idea
                : "Genera una idea creativa para empezar una historia y dejala incompleta"; // Generar nueva idea

            const response = await fetchAiResponse(prompt, 'openai');
            const formattedResponse = response.charAt(0).toUpperCase() + response.slice(1).toLowerCase();
            insertTextAtCursor(formattedResponse);

            // Actualizar el estado para indicar que ya se generó una idea
            setHasGeneratedIdea(true);
        } catch {
            setError('No se pudo generar una idea. Inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTextChange = (text: string) => {
        onChange(text);
        if (text !== lastText) {
            setLastText(text);
            if (text.trim().length > 0) {
                fetchPredictions(text);
            } else {
                setPredictions([]);
            }
            updateHistory(text);
        }
    };

    const updateHistory = (text: string) => {
        const newHistory = [...history.slice(0, currentHistoryIndex + 1), text];
        setHistory(newHistory);
        setCurrentHistoryIndex(newHistory.length - 1);
    };

    const undo = () => {
        if (currentHistoryIndex > 0) {
            setCurrentHistoryIndex(currentHistoryIndex - 1);
            onChange(history[currentHistoryIndex - 1]);
        }
    };

    const redo = () => {
        if (currentHistoryIndex < history.length - 1) {
            setCurrentHistoryIndex(currentHistoryIndex + 1);
            onChange(history[currentHistoryIndex + 1]);
        }
    };

    const insertTextAtCursor = (text: string) => {
        if (quillRef.current) {
            const quill = quillRef.current.getEditor();
            const range = quill.getSelection();
            if (range) {
                quill.insertText(range.index, `${text} `);
                quill.setSelection(range.index + text.length + 1, 0);
            } else {
                quill.insertText(quill.getLength(), `${text} `);
            }
            onChange(quill.getText());
        }
    };

    const fetchPredictions = async (text: string) => {
        if (text.trim().length > 0) {
            try {
                const response = await fetchAiResponse(`Proporciona solo una o dos palabras cortas coherentes y lógicas con el contexto que podrían continuar esta historia, considerando la puntuación y la estructura: "${text}"`, 'openai');
                const predictionList = response
                    .replace(/<[^>]*>/g, '')
                    .toLowerCase()
                    .split(',')
                    .map(pred => pred.trim())
                    .filter(pred => pred);
                setPredictions(predictionList);
            } catch (error) {
                console.error('Error fetching predictions:', error);
            }
        } else {
            setPredictions([]);
        }
    };

    const correctSpellingAndPunctuation = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const currentText = quillRef.current?.getEditor().getText() || '';
            const response = await fetchAiResponse(`Corrige la ortografía y puntuación del siguiente texto, manteniendo el estilo y tono original: "${currentText}"`, 'openai');
            if (quillRef.current) {
                const quill = quillRef.current.getEditor();
                quill.setText(response.charAt(0).toUpperCase() + response.slice(1).toLowerCase());
                onChange(response.charAt(0).toUpperCase() + response.slice(1).toLowerCase());
            }
        } catch {
            setError('No se pudo corregir el texto. Inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveProject = (projectName: string) => {
        localStorage.setItem(`project_${projectName}`, content);
        alert("Proyecto guardado exitosamente.");
    };

    const saveProject = () => {
        setIsSaveModalOpen(true);
    };

    const loadProject = () => {
        setIsModalOpen(true);
    };

    const checkGrammar = async (text: string) => {
        try {
            const response = await axios.post(LANGUAGE_TOOL_URL, null, {
                params: {
                    text,
                    language: 'es',
                },
            });
            return response.data.matches;
        } catch (error) {
            console.error('Error fetching grammar suggestions:', error);
            return [];
        }
    };

    useEffect(() => {
        const savedContent = localStorage.getItem('aiChatContent');
        if (savedContent) {
            onChange(savedContent);
        }
    }, [onChange]);

    useEffect(() => {
        if (content.trim().length > 0) {
            localStorage.setItem('aiChatContent', content);
        }
    }, [content]);

    useEffect(() => {
        const fetchSuggestions = async () => {
            const suggestions = await checkGrammar(content);
            console.log(suggestions);
        };
        fetchSuggestions();
    }, [content]);

    return (
        <div className={`relative w-full h-full ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} p-6 rounded-lg shadow-xl`}>
            <div className="mb-4 flex flex-col md:flex-row justify-between items-center">
                <div className="flex flex-wrap justify-center md:justify-start">
                    <animated.button style={{ ...buttonSpring, ...animatedButtonStyle }} onClick={saveProject} className="ml-2 generate-button">
                        Guardar Historia <Save className="mr-2 icon-style" />
                    </animated.button>
                    <animated.button style={{ ...buttonSpring, ...animatedButtonStyle }} onClick={loadProject} className="ml-2 generate-button">
                        Cargar Historia <CloudUpload className="mr-2 icon-style" /> 
                    </animated.button>
                    <animated.button style={{ ...buttonSpring, ...animatedButtonStyle }} onClick={undo} className="ml-2 generate-button deshacer-button">
                        Deshacer <Undo className="mr-2 icon-style" /> 
                    </animated.button>
                    <animated.button style={{ ...buttonSpring, ...animatedButtonStyle }} onClick={redo} className="ml-2 generate-button rehacer-button">
                        Rehacer <Redo className="mr-2 icon-style" />
                    </animated.button>
                </div>
            </div>
            <animated.div style={useSpring({ opacity: 1, from: { opacity: 0 }, config: config.wobbly })} className="editor-container bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                <ReactQuill
                    ref={quillRef}
                    value={content}
                    onChange={handleTextChange}
                    modules={{
                        toolbar: [
                            [{ 'header': [1, 2, false] }],
                            ['bold', 'italic', 'underline', 'strike'],
                            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                            ['link', 'image'],
                            ['clean']
                        ],
                    }}
                    theme="snow"
                    placeholder="Escribe tu historia aquí..."
                    className="text-white"
                />
            </animated.div>
            {isLoading && (
                <animated.div style={loadingSpring} className="absolute top-2 right-2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                    Procesando...
                </animated.div>
            )}
            {error && (
                <animated.div style={errorSpring} className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {error}
                </animated.div>
            )}
            <div className="predictions-container mt-4 flex flex-wrap gap-2">
                {predictions.map((prediction, index) => {
                    const isSingleWord = prediction.split(' ').length === 1; // Verifica si es una sola palabra
                    return isSingleWord ? (
                        <animated.div 
                            key={index} 
                            style={predictionSpring}
                            className="prediction-item bg-gray-700 hover:bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold cursor-pointer transition duration-300 ease-in-out"
                            onClick={() => insertTextAtCursor(prediction)}
                        >
                            {prediction}
                        </animated.div>
                    ) : (
                        <animated.div 
                            key={index} 
                            style={predictionSpring}
                            className="prediction-item bg-gray-700 hover:bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold cursor-pointer transition duration-300 ease-in-out"
                            onClick={() => insertTextAtCursor(prediction)}
                        >
                            {prediction}
                        </animated.div>
                    );
                })}
            </div>
            <div className="idea-generator mt-4">
                <animated.button 
                    style={{ ...buttonSpring, ...animatedButtonStyle }}
                    onClick={generateIdea} 
                    className="generate-button bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                    Generar Idea <Wand className="icon-style" />
                </animated.button>
                <animated.button 
                    style={{ ...buttonSpring, ...animatedButtonStyle }}
                    onClick={correctSpellingAndPunctuation}
                    className="correct-button mt-4 md:mt-0 py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                >
                    Corregir Ortografía y Puntuación <CheckCircle className="mr-2 icon-style" />
                </animated.button>
            </div>
            <SaveProjectModal 
                isOpen={isSaveModalOpen} 
                onClose={() => setIsSaveModalOpen(false)} 
                onSave={handleSaveProject} 
            />
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <SavedStories onLoadStory={handleLoadStory} />
            </Modal>
        </div>
    );
};

export default AIChat;