// Articles/articleUtils/htmlToSlate.js
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

            // Apply marks to text nodes
            const applyMarks = (children, marks) => {
                return children.map(child => {
                    if ('text' in child) {
                        return { ...child, ...marks };
                    }
                    return child;
                });
            };

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
                    return applyMarks(children, { bold: true });
                case 'em':
                case 'i':
                    return applyMarks(children, { italic: true });
                case 'u':
                    return applyMarks(children, { underline: true });
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

export const isHtmlContent = (content) => {
    if (!content || typeof content !== 'string') return false;
    return content.includes('<') && content.includes('>');
};

export const createSlateEditorState = () => {
    return [
        {
            type: 'paragraph',
            children: [{ text: '' }],
        },
    ];
};

// 🆕 ДОБАВЕНА isSlateEmpty функция
export const isSlateEmpty = (value) => {
    if (!Array.isArray(value) || value.length === 0) return true;
    
    return value.every(node => {
        // Ако е text node
        if ('text' in node) {
            return !node.text || node.text.trim() === '';
        }
        
        // Ако има type (element node), не е празен
        if (node.type) {
            return false;
        }
        
        // Проверяваме children
        if (!node.children || node.children.length === 0) return true;
        return node.children.every(child => !child.text || child.text.trim() === '');
    });
};

// 🆕 ДОБАВЕНА convertSlateToHtml функция за удобство
export const convertSlateToHtml = (slateValue) => {
    if (!Array.isArray(slateValue)) return '';
    
    const serialize = (node) => {
        if (typeof node === 'string') return node;
        if (!node || !node.children) return '';
        
        const children = node.children?.map(n => serialize(n)).join('') || '';
        
        switch (node.type) {
            case 'heading-one':
                return `<h1>${children}</h1>`;
            case 'heading-two':
                return `<h2>${children}</h2>`;
            case 'block-quote':
                return `<blockquote>${children}</blockquote>`;
            case 'bulleted-list':
                return `<ul>${children}</ul>`;
            case 'numbered-list':
                return `<ol>${children}</ol>`;
            case 'list-item':
                return `<li>${children}</li>`;
            case 'paragraph':
            default:
                let text = children;
                if (node.bold) text = `<strong>${text}</strong>`;
                if (node.italic) text = `<em>${text}</em>`;
                if (node.underline) text = `<u>${text}</u>`;
                return node.type === 'paragraph' ? `<p>${text}</p>` : text;
        }
    };
    
    try {
        const result = slateValue.map(serialize).join('');
        return result || '';
    } catch (error) {
        console.error('Грешка при конвертиране на Slate в HTML:', error);
        return '';
    }
};