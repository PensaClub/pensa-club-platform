// htmlToSlate.js
export const htmlToSlate = (html) => {
    if (!html || typeof html !== 'string') {
        return [{ type: 'paragraph', children: [{ text: '' }] }];
    }

    const parser = new DOMParser();
    const document = parser.parseFromString(html, 'text/html');
    
    const deserialize = (el) => {
        if (el.nodeType === 3) {
            return { text: el.textContent };
        } else if (el.nodeType !== 1) {
            return null;
        }

        const children = Array.from(el.childNodes)
            .map(deserialize)
            .flat()
            .filter(x => x !== null);

        if (children.length === 0) {
            children.push({ text: '' });
        }

        switch (el.nodeName) {
            case 'BODY':
                return children;
            case 'BR':
                return { text: '\n' };
            case 'BLOCKQUOTE':
                return { type: 'block-quote', children };
            case 'P':
                return { type: 'paragraph', children };
            case 'H1':
                return { type: 'heading-one', children };
            case 'H2':
                return { type: 'heading-two', children };
            case 'H3':
                return { type: 'heading-three', children };
            case 'UL':
                return { type: 'bulleted-list', children };
            case 'OL':
                return { type: 'numbered-list', children };
            case 'LI':
                return { type: 'list-item', children };
            case 'STRONG':
            case 'B':
                return children.map(child => ({ ...child, bold: true }));
            case 'EM':
            case 'I':
                return children.map(child => ({ ...child, italic: true }));
            case 'U':
                return children.map(child => ({ ...child, underline: true }));
            default:
                return children;
        }
    };

    const nodes = deserialize(document.body);
    return Array.isArray(nodes) ? nodes : [nodes];
};

export const isHtmlContent = (content) => {
    return typeof content === 'string' && (content.includes('<') || content.includes('&'));
};