import React from 'react';
import '../styles/SavedStories.css';
import { BookOpenText } from 'lucide-react'; // Importa el ícono de Lucide React

interface SavedStoriesProps {
    onLoadStory: (content: string) => void;
}

const SavedStories: React.FC<SavedStoriesProps> = ({ onLoadStory }) => {
    const getSavedStories = () => {
        const stories: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('project_')) {
                stories.push(key.replace('project_', ''));
            }
        }
        return stories;
    };

    const handleLoadStory = (storyName: string) => {
        const savedContent = localStorage.getItem(`project_${storyName}`);
        if (savedContent) {
            onLoadStory(savedContent);
        }
    };

    const savedStories = getSavedStories();

    return (
        <div className="saved-stories">
            <h2>Historias Guardadas</h2>
            <ul>
                {savedStories.map((story) => (
                    <li key={story} className="story-item"> {/* Agrega una clase para el estilo */}
                        <button onClick={() => handleLoadStory(story)} className="load-button"> {/* Agrega clase al botón */}
                            Cargar {story}
                            <BookOpenText className="story-icon" /> {/* Mueve el ícono dentro del botón */}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SavedStories;