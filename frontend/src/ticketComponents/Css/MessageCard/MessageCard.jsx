import React from 'react';
import './MessageCard.css'; // Assuming you save the CSS in a separate file
import PropTypes from 'prop-types';

const MessageCard = ({ message }) => {
  const {
    created_by,
    message: content,
    attachment,
    time_date,
    type,
  } = message;

  return (
    <div className="message-card">
      <div className="message-header">
        <span className="user-name">{`User ID: ${created_by}`}</span>
      </div>
      <div className="message-body">
        <p>{content}</p>
        {message.attachments && message.attachments.map((attachment, index) => (
            
            <a
              key={index}
              href={`http://localhost:3000/${attachment}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'block', marginTop: '5px' }}
            >
              {attachment.split(/[/\\]/).pop()}
            </a>
          ))}
      </div>
      <div className="message-footer">
        <span className="date">{new Date(time_date).toLocaleDateString()}</span> • <span className="response-status">{type}</span>
      </div>
    </div>
  );
};
 
MessageCard.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.number.isRequired,
    ticket_id: PropTypes.number.isRequired,
    created_by: PropTypes.number.isRequired,
    time_date: PropTypes.string.isRequired,
    attachment: PropTypes.string,
    message: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  }).isRequired,
};

export default MessageCard;
