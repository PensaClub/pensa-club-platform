// src/utils/slateRenderer.js
import React from 'react';

export const renderSlateContent = (slateValue) => {
    if (!slateValue || !Array.isArray(slateValue)) return '';
    
    const renderText = (textNode) => {
        if (!textNode.text) return null;
        
        let element = textNode.text;
        let style = {};
        
        // Добави font size ако има
        if (textNode.fontSize) {
            style.fontSize = textNode.fontSize;
        }
        
        // Приложи стилове в правилния ред (underline -> italic -> bold)
        if (textNode.underline) {
            element = <u key={`u-${Math.random()}`}>{element}</u>;
        }
        if (textNode.italic) {
            element = <em key={`em-${Math.random()}`}>{element}</em>;
        }
        if (textNode.bold) {
            element = <strong key={`strong-${Math.random()}`}>{element}</strong>;
        }
        
        // Wrap с style ако има fontSize или други inline стилове
        if (Object.keys(style).length > 0) {
            element = <span style={style} key={`styled-${Math.random()}`}>{element}</span>;
        }
        
        return element;
    };
    
    const renderChildren = (children) => {
        if (!children || !Array.isArray(children)) return '';
        
        return children.map((child, index) => {
            if (child.text !== undefined) {
                // Това е text node
                return <span key={index}>{renderText(child)}</span>;
            } else if (child.children) {
                // Това е element node (като list-item)
                return renderChildren(child.children);
            }
            return null;
        });
    };
    
    return slateValue.map((node, index) => {
        const children = renderChildren(node.children);
        
        switch (node.type) {
            case 'paragraph':
                return <p key={index} className="slate-paragraph">{children}</p>;
                
            case 'heading-one':
                return <h1 key={index} className="slate-heading-1">{children}</h1>;
                
            case 'heading-two':
                return <h2 key={index} className="slate-heading-2">{children}</h2>;
                
            case 'heading-three':
                return <h3 key={index} className="slate-heading-3">{children}</h3>;
                
            case 'heading-four':
                return <h4 key={index} className="slate-heading-4">{children}</h4>;
                
            case 'heading-five':
                return <h5 key={index} className="slate-heading-5">{children}</h5>;
                
            case 'heading-six':
                return <h6 key={index} className="slate-heading-6">{children}</h6>;
                
            case 'bulleted-list':
                return (
                    <ul key={index} className="slate-bulleted-list">
                        {node.children?.map((listItem, listIndex) => (
                            <li key={listIndex} className="slate-list-item">
                                {renderChildren(listItem.children)}
                            </li>
                        ))}
                    </ul>
                );
                
            case 'numbered-list':
                return (
                    <ol key={index} className="slate-numbered-list">
                        {node.children?.map((listItem, listIndex) => (
                            <li key={listIndex} className="slate-list-item">
                                {renderChildren(listItem.children)}
                            </li>
                        ))}
                    </ol>
                );
                
            case 'block-quote':
                return (
                    <blockquote key={index} className="slate-blockquote">
                        {children}
                    </blockquote>
                );
                
            case 'list-item':
                return <li key={index} className="slate-list-item">{children}</li>;
                
            default:
                // Default fallback за неизвестни типове
                return <p key={index} className="slate-paragraph">{children}</p>;
        }
    });
};

// Helper за показване на описанието
export const getDescriptionParts = (description) => {
    if (!description) return { firstSentence: '', restSentences: '' };
    
    const sentences = description.split(/(?<=[.!?])\s+/);
    const firstSentence = sentences[0] || '';
    const restSentences = sentences.slice(1).join(' ');
    return { firstSentence, restSentences };
};

// Helper за smooth scroll
export const handleSmoothScroll = (e) => {
    e.preventDefault();
    const targetId = e.currentTarget.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
        targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
};