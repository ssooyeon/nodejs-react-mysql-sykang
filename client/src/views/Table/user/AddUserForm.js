import React, { useRef, useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useAlert } from "react-alert";
import SimpleReactValidator from "simple-react-validator";

import { makeStyles } from "@material-ui/core/styles";
import { Check } from "@material-ui/icons";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { MenuItem } from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Button from "@material-ui/core/Button";

import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import CardBody from "components/Card/CardBody";
import CustomInput from "components/CustomInput/CustomInput";

import { createUser } from "actions/users";
import UserService from "services/UserService";
import GroupService from "services/GroupService";

const styles = {
  errorText: {
    color: "red",
    margin: "auto",
    fontSize: "14px",
  },
  checkButton: {
    marginTop: "20px",
    marginLeft: "-20px",
  },
  checkDoneIcon: {
    marginTop: "40px",
    float: "right",
  },
  formControl: {
    width: "100%",
    paddingTop: "10px",
    paddingRight: "10px",
    paddingLeft: "10px",
  },
};

const useStyles = makeStyles(styles);

export default function AddUserForm({ open, handleCloseClick, handleResetInput }) {
  const classes = useStyles();
  const alert = useAlert();
  const validator = useRef(
    new SimpleReactValidator({
      autoForceUpdate: this,
      messages: {
        in: "Passwords mush match.",
      },
    })
  );

  const initialUserstate = {
    account: "",
    email: "",
    password: "",
    groupId: "",
  };

  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  const [groups, setGroups] = useState([]); // select option에 표시 될 group list (fix)
  const [userForm, setUserForm] = useState(initialUserstate);
  const [checkDoneAccount, setCheckDoneAccount] = useState(""); // 중복확인을 완료한 계정 이름
  const [isValidAccount, setIsValidAccount] = useState(false); // 계정을 중복확인 했는지의 여부
  const dispatch = useDispatch();

  useEffect(() => {
    GroupService.getAll()
      .then((res) => {
        setGroups(res.data);
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);

  // 닫기 버튼 클릭
  const handleClose = () => {
    setIsValidAccount(false);
    handleCloseClick(false);
  };
  // const handleClose = (e, reason) => {
  //   if (reason !== "backdropClick") {
  //     setIsValidAccount(false);
  //     handleCloseClick(false);
  //   }
  // };

  // 사용자 추가를 수행하면 검색란을 초기화
  const sendSearchReset = () => {
    handleResetInput(true);
  };

  // input 값 변경 시 userForm state 업데이트
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserForm({ ...userForm, [name]: value });
  };

  // group 옵션 변경
  const handleGroupOption = (e) => {
    setUserForm({ ...userForm, groupId: e.target.value });
  };

  // 계정 중복 확인
  const checkAccount = () => {
    const account = userForm.account;
    if (account !== "") {
      UserService.findByAccount(userForm.account)
        .then((res) => {
          // 이미 존재하는 계정일 때
          if (res.data !== "" && res.data !== undefined) {
            alert.show("This account already exist.", {
              title: "",
              type: "error",
            });
          } else {
            // 계정 중복 여부 확인 완료
            alert.show("This account is available.", {
              title: "",
              type: "success",
            });
            setCheckDoneAccount(account);
            setIsValidAccount(true);
          }
        })
        .catch((e) => {
          console.log(e);
        });
    }
  };

  // 사용자 등록
  const addUser = () => {
    const valid = validator.current.allValid();
    if (valid) {
      // 중복확인을 완료한 계정과 현재 input의 계정명이 같을 때
      if (checkDoneAccount === userForm.account) {
        let data = userForm;
        if (data.groupId === "") {
          data.groupId = null;
        }
        sendSearchReset();
        dispatch(createUser(data))
          .then(() => {
            alert.show("User create successfully.", {
              title: "",
              type: "success",
              onClose: () => {
                handleClose();
              },
            });
          })
          .catch((e) => {
            console.log(e);
          });
      } else {
        // 중복확인을 완료한 후 다른 계정명을 다시 작성했을 때, 중복확인을 재요청
        alert.show("Please duplicate check an account.", {
          title: "",
          type: "error",
        });
        setIsValidAccount(false);
      }
    } else {
      validator.current.showMessages();
      forceUpdate();
    }
  };

  return (
    <>
      {/* <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title" maxWidth="md" disableBackdropClick> */}
      <Dialog
        open={open}
        onClose={(e, reason) => {
          if (reason !== "backdropClick") {
            handleClose(e, reason);
          }
        }}
        aria-labelledby="form-dialog-title"
        maxWidth="md"
      >
        <form autoComplete="off">
          <DialogTitle id="form-dialog-title">Add new user</DialogTitle>
          <DialogContent>
            <DialogContentText>To register a new user, enter your account name, email, and password and click the Submit button.</DialogContentText>
            <CardBody>
              <GridContainer>
                <GridItem xs={12} sm={12} md={10}>
                  <CustomInput
                    labelText="Account"
                    id="account"
                    name="account"
                    value={userForm.account}
                    formControlProps={{
                      fullWidth: true,
                    }}
                    inputProps={{
                      name: "account",
                      onChange: (e) => handleInputChange(e),
                      onBlur: () => validator.current.showMessageFor("account"),
                    }}
                  />
                  <div className={classes.errorText}>{validator.current.message("account", userForm.account, "required")}</div>
                </GridItem>
                <GridItem xs={12} sm={12} md={2}>
                  {isValidAccount ? (
                    <div className={classes.checkDoneIcon}>
                      <Check />
                    </div>
                  ) : (
                    <div className={classes.checkButton}>
                      <Button variant="outlined" style={{ marginTop: "15px", float: "right" }} onClick={checkAccount}>
                        Check
                      </Button>
                    </div>
                  )}
                </GridItem>
              </GridContainer>
              <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                  <CustomInput
                    labelText="Email"
                    id="email"
                    name="email"
                    value={userForm.email}
                    formControlProps={{
                      fullWidth: true,
                    }}
                    inputProps={{
                      name: "email",
                      onChange: (e) => handleInputChange(e),
                      onBlur: () => validator.current.showMessageFor("email"),
                    }}
                  />
                  <div className={classes.errorText}>{validator.current.message("email", userForm.email, "required|email")}</div>
                </GridItem>
              </GridContainer>
              <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                  <CustomInput
                    labelText="Password"
                    id="password"
                    name="password"
                    value={userForm.password}
                    formControlProps={{
                      fullWidth: true,
                    }}
                    inputProps={{
                      type: "password",
                      name: "password",
                      autoComplete: "off",
                      onChange: (e) => handleInputChange(e),
                      onBlur: () => validator.current.showMessageFor("password"),
                    }}
                  />
                  <div className={classes.errorText}>{validator.current.message("password", userForm.password, "required")}</div>
                </GridItem>
              </GridContainer>
              <GridContainer>
                <FormControl variant="outlined" className={classes.formControl}>
                  <Select id="group-select-helper" value={userForm.groupId || ""} onChange={handleGroupOption} displayEmpty>
                    <MenuItem value="">
                      <em>Select Group</em>
                    </MenuItem>
                    {groups &&
                      groups.map((item, index) => {
                        return (
                          <MenuItem value={item.id} key={item.id}>
                            {item.name}
                          </MenuItem>
                        );
                      })}
                  </Select>
                </FormControl>
              </GridContainer>
            </CardBody>
          </DialogContent>
          <DialogActions style={{ padding: "8px 40px" }}>
            <Button variant="outlined" onClick={addUser}>
              Submit
            </Button>
            <Button variant="outlined" onClick={handleClose}>
              Cancel
            </Button>
          </DialogActions>
          <br />
        </form>
      </Dialog>
    </>
  );
}
