import sanitizeHtml from 'sanitize-html';

export default function sanitizeDescription(req, res, next) {
    if (req.body.description) {
        req.body.description = sanitizeHtml(req.body.description, {
            // Chỉ cho phép các thẻ định dạng văn bản cơ bản
            allowedTags: [ 
                'b', 'i', 'em', 'strong', 'p', 'span', 'div',
                'ul', 'li', 'ol', 'br', 
                'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                'a', 'blockquote', 'pre'
            ],
            allowedAttributes: {
                '*': ['class', 'style'], 

                'li': ['data-list'],

                'span': ['contenteditable', 'class'],
            
                'a': ['href', 'name', 'target'],
            },
            nonTextTags: [ 'style', 'script', 'textarea', 'option', 'noscript', 'span' ],
            exclusiveFilter: function(frame) {
                return frame.tag === 'img'; 
            }
        });
    }
    next();
};