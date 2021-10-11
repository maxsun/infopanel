import * as React from "react";

import { Item, ItemProps } from "../draganddrop/Item";
import { SingleContainer } from "../draganddrop/Container";
import {
  FaUser,
  FaFile,
  FaHatCowboy,
  FaKey,
  FaUserFriends,
} from "react-icons/fa";

export const OsoInspectorContext =
  React.createContext<OsoInspectorState | null>(null);

export const useOsoInspectorContext = () =>
  React.useContext(OsoInspectorContext);

interface OsoObject<T> {
  type: T;
  id: string;
}

interface OsoInspectorState {
  users: OsoObject<"user">[];
  surveys: OsoObject<"survey">[];
  orgs: OsoObject<"org">[];
  actions: string[];
  roleTypes: string[];
}

const CM: Record<ItemProps["type"], string> = {
  user: "#4DCCBD",
  action: "#D81159",
  org: "#533A7B",
  survey: "#FF9F1C",
  roletype: "#A41623",
};

const IM: Record<ItemProps["type"], React.ReactElement> = {
  user: <FaUser />,
  action: <FaKey />,
  org: <FaUserFriends />,
  survey: <FaFile />,
  roletype: <FaHatCowboy />,
};

export const OsoInspecorProvider = (props: { children: any }) => {
  const [state, setState] = React.useState<OsoInspectorState>(null);

  React.useEffect(() => {
    fetch("http://localhost:9001/api/osotest")
      .then((response) => response.json())
      .then((data) => {
        console.log(" context got >>>", data);

        // let allLinks: any[] = [];
        let allUsers: OsoObject<"user">[] = [];
        let allSurveys: OsoObject<"survey">[] = [];
        let allOrgs: OsoObject<"org">[] = [];
        let allRoleTypes: string[] = [];

        data.forEach((role: any) => {
          allRoleTypes.push(role.type);
          if (role.survey_id) {
            allSurveys.push({
              id: String(role.survey_id),
              type: "survey",
            });
          }
          if (role.org_id) {
            allOrgs.push({
              id: String(role.org_id),
              type: "org",
            });
          }
          allUsers.push({
            id: String(role.user_id),
            type: "user",
          });
        });
        setState({
          users: allUsers,
          surveys: allSurveys,
          orgs: allOrgs,
          roleTypes: allRoleTypes,
          actions: [
            "invite_user",
            "remove_user",
            "view_users",
            "view_role_assignments",
            "create_role_assignments",
            "delete_role_assignments",
            "edit_survey_roles",
            "view_all_surveys",
            "create_surveys",
            "delete_surveys",
            "manage_subscription",
            "view_survey",
            "download_files",
            "upload_files",
          ],
        });
      });
  }, []);

  return (
    <OsoInspectorContext.Provider value={state}>
      {props.children}
    </OsoInspectorContext.Provider>
  );
};

export const ListPane = () => {
  //   let ctx = useOsoInspectorContext();

  let ctx = useOsoInspectorContext();
  console.log("...", ctx);
  if (!ctx) {
    return <div>loading...</div>;
  }

  let allEntities: any[] = ctx.orgs.concat(
    (ctx.surveys as any[]).concat(ctx.users as any[])
  );

  console.log(allEntities);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "scroll",
      }}
    >
      {allEntities.map((item: OsoObject<"org" | "user" | "survey">) => (
        <Item
          value={item.id}
          type={item.type}
          color={CM[item.type]}
          isDropped={false}
          icon={IM[item.type]}
        ></Item>
      ))}
      {ctx.actions.map((t) => (
        <Item
          value={t}
          type={"action"}
          color={CM["action"]}
          icon={IM["action"]}
          isDropped={false}
        ></Item>
      ))}
      {ctx.roleTypes.map((t) => (
        <Item
          value={t}
          type={"roletype"}
          icon={IM["roletype"]}
          color={CM["roletype"]}
          isDropped={false}
        ></Item>
      ))}
    </div>
  );
};

export const QueryPane = () => {
  let [output, setOutput] = React.useState(null);

  let [actorVal, setActorVal] = React.useState<OsoObject<"user">>(null);
  let [roleVal, setRoleVal] = React.useState<string>(null);
  let [resourceVal, setResourceVal] =
    React.useState<OsoObject<"survey" | "org">>(null);

  React.useEffect(() => {
    console.log(actorVal, roleVal, resourceVal);
    console.log("fetching....");
    if (actorVal && roleVal && resourceVal) {
      fetch(
        `http://localhost:9001/api/osotest/query/${actorVal.id}/${roleVal}/${resourceVal.id}`
      )
        .then((response) => response.json())
        .then((data) => {
          console.log("!!!!!!!", data);
          setOutput(data);
        });
    }
  }, [actorVal, roleVal, resourceVal]);
  //   const onChange = () => {
  //   };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div>
        Is
        <SingleContainer
          color={(val: string) =>
            val in CM ? CM[val as ItemProps["type"]] : "pink"
          }
          onChange={(newVal) => {
            setActorVal({
              id: newVal,
              type: "user",
            });
          }}
          accepts={["user"]}
        ></SingleContainer>{" "}
        a
        <SingleContainer
          color={(val: string) =>
            val in CM ? CM[val as ItemProps["type"]] : "pink"
          }
          onChange={(newVal) => {
            setRoleVal(newVal);
          }}
          accepts={["action"]}
        ></SingleContainer>
        of
        <SingleContainer
          color={(val: string) =>
            val in CM ? CM[val as ItemProps["type"]] : "pink"
          }
          onChange={(newVal) => {
            setResourceVal({
              id: newVal,
              type: "survey",
            });
          }}
          accepts={["survey", "org"]}
        ></SingleContainer>{" "}
        ?
      </div>
      <div>
        {output ? (
          <div
            style={{
              width: "100%",
              height: 30,
              backgroundColor: "green",
            }}
          >
            Yes!
          </div>
        ) : (
          <div
            style={{
              width: "100%",
              height: 30,
              backgroundColor: "red",
            }}
          >
            No!
          </div>
        )}
      </div>
    </div>
  );
};
