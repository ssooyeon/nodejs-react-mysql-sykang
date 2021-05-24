import React, { useRef, useState, useCallback, useEffect } from "react";
import SimpleReactValidator from "simple-react-validator";

import { makeStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "components/CustomButtons/Button";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import CardBody from "components/Card/CardBody";
import CustomInput from "components/CustomInput/CustomInput";

import FolderService from "services/FolderService";

const styles = {
  errorText: {
    color: "red",
    margin: "auto",
    fontSize: "14px",
  },
};

const useStyles = makeStyles(styles);

export default function EditColumnForm({ open, handleCloseClick, column }) {
  const classes = useStyles();
  const validator = useRef(new SimpleReactValidator({ autoForceUpdate: this }));

  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  const [columnForm, setColumnForm] = useState([]);

  useEffect(() => {
    setColumnForm({ ...column });
  }, [column]);

  // 부모에게 완료사항 전달
  const handleClose = () => {
    handleCloseClick(false);
  };

  // input 값 변경 시 columnForm state 업데이트
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setColumnForm({ ...columnForm, [name]: value });
  };

  // 컬럼 수정 버튼 클릭
  const editColumn = () => {
    const valid = validator.current.allValid();
    if (valid) {
      const data = {
        id: columnForm.id,
        name: columnForm.name,
      };
      edit(data);
    } else {
      validator.current.showMessages();
      forceUpdate();
    }
  };

  // 컬럼 수정
  const edit = (column) => {
    FolderService.update(column.id, column)
      .then(() => {
        handleClose();
      })
      .catch((e) => {
        console.log(e);
      });
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title" maxWidth="md">
        <form autoComplete="off">
          <DialogTitle id="form-dialog-title">Edit Column</DialogTitle>
          <DialogContent>
            <DialogContentText>To Edit a folder (or column), enter name and click the Submit button.</DialogContentText>
            <CardBody>
              <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                  <CustomInput
                    labelText="Name"
                    id="name"
                    name="name"
                    value={columnForm.name}
                    defaultValue={columnForm.name}
                    formControlProps={{
                      fullWidth: true,
                    }}
                    inputProps={{
                      name: "name",
                      onChange: (e) => handleInputChange(e),
                      onBlur: () => validator.current.showMessageFor("name"),
                    }}
                  />
                  <div className={classes.errorText}>{validator.current.message("name", columnForm.name, "required")}</div>
                </GridItem>
              </GridContainer>
            </CardBody>
          </DialogContent>
          <DialogActions>
            <Button onClick={editColumn} color="primary">
              Submit
            </Button>
            <Button onClick={handleClose}>Cancel</Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
