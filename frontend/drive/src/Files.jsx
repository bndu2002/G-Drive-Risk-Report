import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "./Image/logo.png";
import { Space, Table } from "antd";
import { Collapse } from "antd";
import { Card, Col, Row } from "antd";
import { Alert, Spin } from "antd";
import { Progress } from "antd";
import "./index.css";

function Files() {
  const backendUrl = 'https://g-drive-risk-report-lvn6.vercel.app'
  const [publicFiles, setpublicFiles] = useState([]);
  const [externallyShared, setexternallyShared] = useState([]);
  const [peopleWithAccess, setpeopleWithAccess] = useState([]);
  const [refreshed, setRefreshed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [percent, setPercent] = useState(0);
  const [riskScore, setriskScore] = useState("");
  const image = logo;

  const navigate = useNavigate();
  const getDriveFiles = async () => {
    try {
      setLoading(true);
      let fetchObject = {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        Credential: "includes",
      };
                        //constructor 👇 creates a new object that represents the query parameters in the URL.                     
      const urlParams = new URLSearchParams(window.location.search);
                                            //👆returns the query string part of the current URL
                  // 👇 retrieves the value of the code parameter
      const code = urlParams.get("code");

      const response = await fetch(
        `${backendUrl}/Oauth2callback?code=${code}`,
        fetchObject
      );

      console.log(response);

      let data;

      if (response.ok) {
        data = await response.json();
        let files = data.data;

        setpublicFiles(() => {
          return [...files.publicFiles];
        });
        //array of object was complex hence deep copy instead of shallow
        setpeopleWithAccess(JSON.parse(JSON.stringify(files.peopleWithAccess)));
        setexternallyShared(() => {
          return [...files.externallyShared];
        });
        //indigate();
        console.log("here is thsi", peopleWithAccess);
      } else {
        let {message } = data;
        window.alert(message);
      }
      setLoading(false);
    } catch (error) {
      return console.log(error.message);
    }
  };

  const revokeToken = async () => {
    try {
      const confirmed = window.confirm(
        "Are you sure you want to revoke the token?"
      );
      if (!confirmed) {
        return;
      }

      let fetchObject = {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        Credential: "includes",
      };

      let response = await fetch(`${backendUrl}/auth/revokeToken`, fetchObject);

      if (response.ok) {
        navigate("/");
      } else {
        let errmsg = await response.json();
        let { message } = errmsg;
        window.alert(message);
      }
    } catch (error) {
      return console.log(error.message);
    }
  };

  const columns = [
    {
      title: "File Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <a href={record.link} target="_blank" rel="noreferrer">
          {text}
        </a>
      ),
    },
    {
      title: "Access Setting",
      dataIndex: "accessSetting",
      key: "accessSetting",
    },
    {
      title: "Shared With",
      dataIndex: "sharedWithCount",
      key: "sharedWithCount",
    },
    {
      title: "Created By",
      dataIndex: "createdByname",
      key: "createdByname",
      render: (text, record) => <a href={`mailto:${record.email}`}>{text}</a>,
    },
  ];

  const indigate = () => {
    let value;
    console.log("from indicate", externallyShared.length);
    if (externallyShared.length >= 20) {
      value = Math.floor(Math.random() * 6) + 90;
      console.log("hell");
      setPercent(value);
    } else if (externallyShared.length > 10) {
      value = Math.floor(Math.random() * 11) + 65;
      setPercent(value);
    } else {
      value = Math.floor(Math.random() * 16) + 45;
      setPercent(value);
    }
  };

  function getColor(percent) {
    if (percent >= 90) {
      return "#f5222d"; // red
    } else if (percent >= 65) {
      return "#FFA500"; //orange
    } else {
      return "#faad14"; // yellow
    }
  }

  function getRiskScore(percent) {
    if (percent >= 90) {
      setriskScore("Critical");
    } else if (percent > 40 && percent < 90) {
      setriskScore("High");
    } else {
      setriskScore("Negligible");
    }
  }

  const { Panel } = Collapse;

  useEffect(() => {
    if (!refreshed) {
      // Only call getDriveFiles if the component has not been refreshed yet
      getDriveFiles();
      setRefreshed(true);
    }
    // eslint-disable-next-line 
  }, [refreshed]);

  useEffect(() => {
    indigate();
    getRiskScore(percent);
    // eslint-disable-next-line 
  }, [externallyShared]);

  return (
    <>
      {loading ? (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <Space
            direction="vertical"
            style={{
              width: "100%",
            }}
          >
            <Spin tip="Loading...">
              <Alert
                message="Alert message title"
                description="Further details about the context of this alert."
                type="info"
              />
            </Spin>
          </Space>
        </div>
      ) : (
        <>
          <button className="revoke_btn" onClick={revokeToken}>
            Revoke access
          </button>
          <div className="logo">
            <div style={{ marginRight: "20px", marginTop: "10px" }}>
              <img
                src={image}
                alt="Google Drive Risk Report"
                style={{ width: "30px", height: "30px" }}
              />
            </div>
            <div>Goggle Drive Risk Report</div>
          </div>
          <div
            className={`state ${
              riskScore === "Critical"
                ? "red"
                : riskScore === "High"
                ? "orange"
                : "yellow"
            }`}
            style = {{fontSize : "23px" , paddingTop:"10px" , fontWeight :  "bold" }}
          >
            <span style={{ color: "black", fontSize: "large"  }}>
              Risk Score :
            </span>
            {riskScore}
          </div>
          <div className="analysis">
            <div className="cards" style={{ width: "1000px" }}>
              <Row
                gutter={16}
                style={{ display: "flex", justifyContent: "flex-end" }}
              >
                <div className="indigator">
                  <Progress
                    type="circle"
                    percent={percent}
                    strokeColor={getColor(percent)}
                    style={{ marginRight: 8 }}
                  />
                </div>
                <Col span={5}>
                  <div className="card">
                    <Card
                      title={
                        <h1
                          style={{
                            textAlign: "center",
                            fontSize: "36px",
                          }}
                        >
                          📡
                        </h1>
                      }
                      bordered={false}
                    >
                      <div className="card_content">
                        <div className="number">{publicFiles.length}</div>
                        <div className="text" style={{ fontWeight: "bold" }}>
                          Public files
                        </div>
                        <div className="text">
                          files that are available to anyone via link sharing
                        </div>
                      </div>
                    </Card>
                  </div>
                </Col>
                <Col span={5}>
                  <div className="card">
                    <Card
                      title={
                        <h1 style={{ textAlign: "center", fontSize: "36px" }}>
                          👥
                        </h1>
                      }
                      bordered={false}
                    >
                      <div className="card_content">
                        <div className="number">{peopleWithAccess.length}</div>
                        <div className="text" style={{ fontWeight: "bold" }}>
                          {" "}
                          People with access
                        </div>
                        <div className="text">
                          people who have access to files in your google drive
                        </div>
                      </div>
                    </Card>
                  </div>
                </Col>
                <Col span={5}>
                  <div className="card">
                    <Card
                      title={
                        <h1 style={{ textAlign: "center", fontSize: "36px" }}>
                          📝
                        </h1>
                      }
                      bordered={false}
                    >
                      <div className="card_content">
                        <div className="number">{externallyShared.length}</div>
                        <div className="text" style={{ fontWeight: "bold" }}>
                          {" "}
                          Externally shared files
                        </div>
                        <div className="text">
                          files that have been shared directly with other people
                        </div>
                      </div>
                    </Card>
                  </div>
                </Col>
              </Row>
            </div>
          </div>

          <div className="public_files">
            <h1 style={{ backgroundColor: "#967bb6" }}>
              1. {publicFiles.length} files are publicly accessible for anyone
              with the link
            </h1>
            <Table
              dataSource={publicFiles.map((file, index) => {
                return {
                  key: index,
                  name: file.name,
                  accessSetting: file.accessSetting,
                  sharedWithCount: file.sharedWithCount,
                  createdByname: file.createdByname,
                  link: file.linkToFile,
                  email: file.createdByemail,
                };
              })}
              columns={columns}
            />
          </div>

          <div className="people_withAccess">
            <h1 style={{ backgroundColor: "#967bb6" }}>
              2. There are {peopleWithAccess.length} people with access to your
              Google Drive
            </h1>
            {peopleWithAccess.map((value, index) => {
              let email = Object.keys(value)[0];
              let files = Object.values(value)[0];
              return (
                <Collapse size="large">
                  <Panel
                    header={
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>{email}</span>
                        <span>Has Access To {files.length} Files</span>
                      </div>
                    }
                    key="1"
                  >
                    <div>
                      <Table
                        dataSource={files.map((file, index) => {
                          return {
                            key: index,
                            name: file.fileName,
                            accessSetting: file.accessSetting,
                            sharedWithCount: file.sharedWithCount,
                            createdByname: file.createdByname,
                            link: file.linkToFile,
                            email: file.createdByEmail,
                          };
                        })}
                        columns={columns}
                      />
                    </div>
                  </Panel>
                </Collapse>
              );
            })}
          </div>
          <div className="externally_shared">
            <h1 style={{ backgroundColor: "#967bb6" }}>
              3. {externallyShared.length} files are shared externally
            </h1>
            <Table
              dataSource={externallyShared.map((file, index) => {
                return {
                  key: index,
                  name: file.name,
                  accessSetting: file.accessSetting,
                  sharedWithCount: file.sharedWithCount,
                  createdByname: file.createdByname,
                  link: file.linkToFile,
                  email: file.createdByemail,
                };
              })}
              columns={columns}
            />
          </div>
        </>
      )}
    </>
  );
}

export default Files;
