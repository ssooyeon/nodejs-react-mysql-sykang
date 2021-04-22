import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateTutorial, deleteTutorial } from "../actions/tutorials";
import TutorialDataService from "../services/TutorialService";

const Tutorial = (props) => {
  const initialTutorialState = {
    id: null,
    title: "",
    desciption: "",
    published: false,
  };
  const [currentTutorial, setCurrentTutorial] = useState(initialTutorialState);
  const [message, setMessage] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    getTutorial(props.match.params.id);
  }, [props.match.params.id]);

  const getTutorial = (id) => {
    TutorialDataService.get(id)
      .then((res) => {
        setCurrentTutorial(res.data);
        console.log(res.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentTutorial({ ...currentTutorial, [name]: value });
  };

  const updateStatus = (status) => {
    const data = {
      id: currentTutorial.id,
      title: currentTutorial.title,
      desciption: currentTutorial.desciption,
      published: status,
    };
    dispatch(updateTutorial(currentTutorial.id, data))
      .then((res) => {
        console.log(res);
        setCurrentTutorial({ ...currentTutorial, published: status });
        setMessage("The status was updated successfully.");
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const updateContent = () => {
    dispatch(updateTutorial(currentTutorial.id, currentTutorial))
      .then((res) => {
        console.log(res);
        setMessage("The tutorial was updated successfully.");
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const removeTutorial = () => {
    dispatch(deleteTutorial(currentTutorial.id))
      .then(() => {
        props.history.push("/tutorials");
      })
      .catch((e) => {
        console.log(e);
      });
  };

  return (
    <div>
      {currentTutorial ? (
        <div className="edit-form">
          <h4>Tutorial</h4>
          <form>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input type="text" className="form-control" id="title" name="title" value={currentTutorial.title} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <input
                type="text"
                className="form-control"
                id="description"
                name="description"
                value={currentTutorial.description}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>
                <strong>Status: </strong>
              </label>
              {currentTutorial.published ? "Published" : "Pending"}
            </div>
          </form>

          {currentTutorial.published ? (
            <button className="badge badge-primary mr-2" onClick={() => updateStatus(false)}>
              UnPublish
            </button>
          ) : (
            <button className="badge badge-primary mr-2" onClick={() => updateStatus(true)}>
              Publish
            </button>
          )}
          <button className="badge badge-danger mr-2" onClick={removeTutorial}>
            Delete
          </button>
          <button type="submit" className="badge badge-success" onClick={updateContent}>
            Update
          </button>
          <p>{message}</p>
        </div>
      ) : (
        <div>
          <br />
          <p>Please click on a Tutorial...</p>
        </div>
      )}
    </div>
  );
};

export default Tutorial;
