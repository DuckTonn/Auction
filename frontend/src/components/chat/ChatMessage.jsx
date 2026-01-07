import React, { useMemo } from 'react';
import Linkify from 'linkify-react';

export const MessageType = {
    Inbound: 'inbound',
    Outbound: 'outbound'
};

const ChatMessage = ({ type, text, avatar, config, style, onLinkClick }) => {
    const isOutbound = type === MessageType.Outbound;

    const backgroundColor = useMemo(() => {
        if (isOutbound) {
            return config?.appearance?.brandColor || '#3B82F6'; // Blue-500
        } else {
            // Inbound messages - light gray
            return '#F3F4F6'; // Gray-100
        }
    }, [config?.appearance?.brandColor, isOutbound]);

    const textColor = useMemo(() => {
        if (isOutbound) {
            return '#FFFFFF'; // White text for outbound
        } else {
            return '#1F2937'; // Gray-800 for inbound
        }
    }, [isOutbound]);

    if (!text) return null;

    // Custom link renderer
    const renderLink = ({ attributes, content }) => {
        const { href, ...rest } = attributes;

        if (onLinkClick) {
            return (
                <a href="#" {...rest} onClick={(e) => {
                        e.preventDefault();
                        onLinkClick(href);
                    }}
                    className="underline hover:opacity-80 transition-opacity"
                    style={{ color: 'inherit' }}>
                    {content}
                </a>
            );
        }

        return (
            <a href={href}{...rest} target="_blank"
                rel="noopener noreferrer"
                className="underline hover:opacity-80 transition-opacity"
                style={{ color: 'inherit' }}>
                {content}
            </a>
        );
    };

    return (
        <div style={style} className={`flex items-end gap-1.5 ${isOutbound ? 'self-end flex-row-reverse' : 'self-start'}`}>
            {/* Avatar */}
            {avatar && (
                <div className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded-full flex-shrink-0 mb-0.5">
                    <img
                        src={avatar}
                        alt="Avatar"
                        className="w-full h-full object-cover rounded-full"
                    />
                </div>
            )}

            {/* Message Bubble */}
            <div
                className="rounded-[18px] px-3 py-1.5 text-[13px] leading-[18px] max-w-[260px]"
                style={{backgroundColor, color: textColor,
                    borderBottomLeftRadius: !isOutbound && avatar ? '4px' : undefined,
                    borderBottomRightRadius: isOutbound && avatar ? '4px' : undefined}}>
                <div className="whitespace-pre-wrap break-words">
                    <Linkify options={{ render: renderLink, target: '_blank', rel: 'noopener noreferrer' }}>
                        {text}
                    </Linkify>
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;
