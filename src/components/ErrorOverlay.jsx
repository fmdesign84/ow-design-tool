/**
 * ErrorOverlay - 개발용 에러 추적 오버레이
 * 콘솔 에러를 화면에 실시간 표시
 */
import React, { useState, useEffect } from 'react';

const ErrorOverlay = () => {
    const [errors, setErrors] = useState([]);
    const [isMinimized, setIsMinimized] = useState(false);

    useEffect(() => {
        // 전역 에러 핸들러
        const handleError = (event) => {
            const error = {
                id: Date.now(),
                type: 'error',
                message: event.message || String(event),
                source: event.filename ? `${event.filename}:${event.lineno}:${event.colno}` : 'unknown',
                timestamp: new Date().toLocaleTimeString()
            };
            setErrors(prev => [error, ...prev].slice(0, 10)); // 최근 10개만 유지
        };

        // Promise rejection 핸들러
        const handleRejection = (event) => {
            const error = {
                id: Date.now(),
                type: 'promise',
                message: event.reason?.message || String(event.reason),
                source: event.reason?.stack?.split('\n')[1]?.trim() || 'unknown',
                timestamp: new Date().toLocaleTimeString()
            };
            setErrors(prev => [error, ...prev].slice(0, 10));
        };

        // console.error 가로채기
        const originalConsoleError = console.error;
        console.error = (...args) => {
            originalConsoleError.apply(console, args);
            const message = args.map(arg =>
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ');

            // React 내부 에러 무시
            if (message.includes('React') && message.includes('warning')) return;

            const error = {
                id: Date.now(),
                type: 'console',
                message: message.substring(0, 500),
                source: new Error().stack?.split('\n')[2]?.trim() || 'console.error',
                timestamp: new Date().toLocaleTimeString()
            };
            setErrors(prev => [error, ...prev].slice(0, 10));
        };

        window.addEventListener('error', handleError);
        window.addEventListener('unhandledrejection', handleRejection);

        return () => {
            window.removeEventListener('error', handleError);
            window.removeEventListener('unhandledrejection', handleRejection);
            console.error = originalConsoleError;
        };
    }, []);

    if (errors.length === 0) return null;

    const styles = {
        container: {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 99999,
            fontFamily: 'monospace',
            fontSize: '12px',
            maxWidth: isMinimized ? '60px' : '500px',
            maxHeight: isMinimized ? '40px' : '300px',
            background: '#1a1a1a',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            overflow: 'hidden',
            border: '2px solid #ff4444'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 12px',
            background: '#ff4444',
            color: 'white',
            cursor: 'pointer'
        },
        badge: {
            background: 'white',
            color: '#ff4444',
            borderRadius: '10px',
            padding: '2px 8px',
            fontWeight: 'bold'
        },
        errorList: {
            maxHeight: '250px',
            overflowY: 'auto',
            padding: '8px'
        },
        errorItem: {
            padding: '8px',
            marginBottom: '6px',
            background: '#2a2a2a',
            borderRadius: '4px',
            borderLeft: '3px solid #ff4444'
        },
        errorType: {
            color: '#ff8888',
            fontWeight: 'bold',
            marginRight: '8px'
        },
        errorTime: {
            color: '#888',
            fontSize: '10px'
        },
        errorMessage: {
            color: '#fff',
            marginTop: '4px',
            wordBreak: 'break-word'
        },
        errorSource: {
            color: '#888',
            fontSize: '10px',
            marginTop: '4px'
        },
        clearBtn: {
            background: 'transparent',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: '4px 8px'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header} onClick={() => setIsMinimized(!isMinimized)}>
                <span>🐛 에러 <span style={styles.badge}>{errors.length}</span></span>
                {!isMinimized && (
                    <button
                        style={styles.clearBtn}
                        onClick={(e) => { e.stopPropagation(); setErrors([]); }}
                    >
                        ✕ 지우기
                    </button>
                )}
            </div>
            {!isMinimized && (
                <div style={styles.errorList}>
                    {errors.map(err => (
                        <div key={err.id} style={styles.errorItem}>
                            <div>
                                <span style={styles.errorType}>[{err.type}]</span>
                                <span style={styles.errorTime}>{err.timestamp}</span>
                            </div>
                            <div style={styles.errorMessage}>{err.message}</div>
                            <div style={styles.errorSource}>{err.source}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ErrorOverlay;
