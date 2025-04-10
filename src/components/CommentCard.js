import React from "react";
import { Button } from "react-bootstrap";

const CommentCard = ({
  comment,
  isReply = false,
  onEdit,
  onDelete,
  onReplyToggle,
  onReplySubmit,
  replyContent,
  setReplyContent,
  showReplyForm,
}) => {
  return (
    <div className={`comment-card ${isReply ? "reply-card" : ""}`}>
      <div className="comment-header">
        <img src={comment.profile_image} alt="avatar" className="comment-avatar" />
        <div className="comment-meta">
          <strong>{comment.author}</strong>
          <p className="text-muted small">
            {comment.updated_at !== comment.created_at
              ? `Updated ${new Date(comment.updated_at).toLocaleString()}`
              : `Posted ${new Date(comment.created_at).toLocaleString()}`}
          </p>
        </div>
      </div>

      <div className="comment-body">
        <p>{comment.content}</p>

        <div className="mt-2 d-flex gap-2">
          <Button size="sm" variant="outline-primary">
            👍 Like | {comment.likes_count || 0}
          </Button>
          <Button size="sm" variant="outline-secondary" onClick={() => onReplyToggle(comment.id)}>
            ↩ Reply
          </Button>
        </div>

        {showReplyForm?.[comment.id] && (
          <div className="mt-2">
            <textarea
              rows={2}
              placeholder="Write a reply..."
              value={replyContent?.[comment.id] || ""}
              onChange={(e) => setReplyContent({ ...replyContent, [comment.id]: e.target.value })}
            />
            <Button size="sm" onClick={() => onReplySubmit(comment.id)} className="mt-2">
              ➤ Submit
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentCard;
