declare module 'docx' {
    export class Document {
        constructor(options?: any);
    }
    export class Packer {
        static toBlob(doc: Document): Promise<Blob>;
    }
    export class Paragraph {
        constructor(options?: any);
    }
    export class TextRun {
        constructor(text: string, options?: any);
    }
}