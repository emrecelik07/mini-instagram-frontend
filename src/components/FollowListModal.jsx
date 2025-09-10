import React from "react";
import { Modal, ListGroup, Image, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import avatarFallback from "../assets/img/avatarfallback.png";
import { AppConstants } from "../util/constants.js";

export default function FollowListModal({ show, title, users, loading, onHide }) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="d-flex justify-content-center py-4">
            <Spinner animation="border" />
          </div>
        ) : users && users.length > 0 ? (
          <ListGroup variant="flush">
            {users.map((u) => (
              <ListGroup.Item key={u.userId} className="d-flex align-items-center gap-3">
                <Link to={`/user/${u.username}`} className="d-flex align-items-center gap-3 text-decoration-none text-reset" onClick={onHide}>
                  <Image
                    src={u.profileImageUrl ? `${AppConstants.getBaseUrl()}${u.profileImageUrl}` : avatarFallback}
                    alt={u.username}
                    roundedCircle
                    style={{ width: 40, height: 40, objectFit: "cover", border: "1px solid #ddd" }}
                  />
                  <div className="d-flex flex-column">
                    <strong>{u.username}</strong>
                    {u.name ? <small className="text-muted">{u.name}</small> : null}
                  </div>
                </Link>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <div className="text-center text-muted py-3">No users to show</div>
        )}
      </Modal.Body>
    </Modal>
  );
}


