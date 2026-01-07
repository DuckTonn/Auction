const simpleLogger = (req, res, next) => {
    res.on('finish', () => {
        const status = res.statusCode;
        let color = '\x1b[0m'; // default
        
        if (status >= 200 && status < 300) color = '\x1b[32m'; // green
        else if (status >= 300 && status < 400) color = '\x1b[36m'; // cyan
        else if (status >= 400 && status < 500) color = '\x1b[33m'; // yellow
        else if (status >= 500) color = '\x1b[31m'; // red
        
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${color}${status}\x1b[0m`);
    });
    
    next();
};

export default simpleLogger;