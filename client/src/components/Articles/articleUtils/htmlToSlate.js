// htmlToSlate.js
export const htmlToSlate = (html) => {
    if (!html || typeof html !== 'string') {
        return [{ type: 'paragraph', children: [{ text: '' }] }];
    }

    // Ако няма HTML тагове, връщаме като обикновен текст
    if (!html.includes('<') || !html.includes('>')) {
        return html.trim() ? [{ type: 'paragraph', children: [{ text: html }] }] : [{ type: 'paragraph', children: [{ text: '' }] }];
    }

    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const parseNode = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                return { text: node.textContent };
            }
            
            if (node.nodeType !== Node.ELEMENT_NODE) {
                return null;
            }

            const children = Array.from(node.childNodes)
                .map(parseNode)
                .filter(Boolean);
            
            if (children.length === 0) {
                children.push({ text: '' });
            }

            switch (node.tagName.toLowerCase()) {
                case 'h1':
                    return { type: 'heading-one', children };
                case 'h2':
                    return { type: 'heading-two', children };
                case 'p':
                    return { type: 'paragraph', children };
                case 'blockquote':
                    return { type: 'block-quote', children };
                case 'ul':
                    return { type: 'bulleted-list', children };
                case 'ol':
                    return { type: 'numbered-list', children };
                case 'li':
                    return { type: 'list-item', children };
                case 'strong':
                case 'b':
                    return children.map(child => ({ ...child, bold: true }));
                case 'em':
                case 'i':
                    return children.map(child => ({ ...child, italic: true }));
                case 'u':
                    return children.map(child => ({ ...child, underline: true }));
                default:
                    return { type: 'paragraph', children };
            }
        };

        const result = Array.from(doc.body.childNodes)
            .map(parseNode)
            .filter(Boolean);

        return result.length > 0 ? result : [{ type: 'paragraph', children: [{ text: '' }] }];
        
    } catch (error) {
        console.error('HTML parsing error:', error);
        const textContent = html.replace(/<[^>]*>/g, '');
        return textContent.trim() ? [{ type: 'paragraph', children: [{ text: textContent }] }] : [{ type: 'paragraph', children: [{ text: '' }] }];
    }
};