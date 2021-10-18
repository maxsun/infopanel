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
import ForceGraph2D, { ForceGraphProps } from "react-force-graph-2d";
import ForceGraph3D from "react-force-graph-3d";
import SpriteText from "three-spritetext";
import { useResizeDetector } from "react-resize-detector";

export const OsoInspectorContext =
  React.createContext<OsoInspectorState | null>(null);

export const useOsoInspectorContext = () =>
  React.useContext(OsoInspectorContext);

interface OsoObject<T> {
  type: T;
  value: any;
  label: string;
}

interface OsoInspectorState {
  users: OsoObject<"user">[];
  surveys: OsoObject<"survey">[];
  orgs: OsoObject<"org">[];
  actions: OsoObject<"action">[];
  roleTypes: string[];
  roles: any[];
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
    let headers = new Headers();
    let token =
      "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlFoZE8yXzNPV3drODhPYVE5OEFSSCJ9.eyJpc3MiOiJodHRwczovL2JlZHJvY2tvY2Vhbi51cy5hdXRoMC5jb20vIiwic3ViIjoiYXV0aDB8NjBlY2IyMzQxMmY3MzYwMDZhZTUxNjA0IiwiYXVkIjoiaHR0cHM6Ly9iZWRyb2Nrb2NlYW4uY29tL2FwaSIsImlhdCI6MTYzNDQ5OTMyNiwiZXhwIjoxNjM0NTg1NzI2LCJhenAiOiJPR3l0T3ZTNmRhSWFBaUhTN3RVOWJkZjl6T1A5eTZZbSJ9.ujdSQ7PrEcJMciPfrLL-_BmgDP_VvQDO36j2HC4UDDLP8P7r1gaihzXdc6_AJwbcxzKpBmlWfzZwBmdCOuKC-rTiKbPCm5AQXhJ2UkEW4MPD4yQnzDxpeRGw8XM3rKnvDB4WgSFeg11uY0Rldl7G0GhKQmjOnynELirGxHDaS_3LP9P9W-znxCi180xZ679qpnC5xiRECeVSoG-bPNQx07xQ2XjDNBnqthUAk4rMLFM4WbRsYDAI6WgDr4Btn48sItpX1N5qfe8h5yCJSGrWmTv81lDiSYkUs42aN545mwMRFNAYElewiX_HEHpnToI5VvDkm9GLDQ9qL7xT95d1DQ";
    headers.set("Authorization", `Bearer ${token}`);
    fetch("http://localhost:9001/api/admin/all_roles", {
      method: "GET",
      mode: "cors", // no-cors, *cors, same-origin
      headers: headers,
    })
      .then((response) => response.json())
      .then((data) => {
        let allUsers: OsoObject<"user">[] = data["users"].map((user: any) => ({
          value: user.id,
          label: user.name,
          type: "user",
        }));
        let allSurveys: OsoObject<"survey">[] = data["surveys"].map(
          (survey: any) => ({
            value: survey.survey_uuid,
            label: survey.name,
            type: "survey",
          })
        );
        let allOrgs: OsoObject<"org">[] = data["orgs"].map((org: any) => ({
          value: org.id,
          label: org.name,
          type: "org",
        }));
        let allActions: OsoObject<"action">[] = data["actions"].map(
          (action: string) => ({
            value: action,
            label: action,
            type: "action",
          })
        );
        let allRoles = data["roles"].map((role: any) => ({
          organization: role.organization,
          survey: role.survey,
          user: role.user,
          type: role.type,
        }));

        setState({
          users: allUsers,
          surveys: allSurveys,
          orgs: allOrgs,
          roleTypes: [],
          roles: allRoles,
          actions: allActions,
        });
      });

    // fetch("http://localhost:9001/api/osotest/entities")
    //   .then((response) => response.json())
    //   .then((data) => {
    //     console.log(" context got >>>", data);

    //     // Object.keys(data).forEach((entityType) => {
    //     //   console.log(entityType);
    //     // });

    //     // let allLinks: any[] = [];

    //     // let allOrgs: OsoObject<"org">[] = [];
    //     // let allRoleTypes: string[] = [];

    //     // data.forEach((role: any) => {
    //     //   allRoleTypes.push(role.type);
    //     //   if (role.survey_id) {
    //     //     allSurveys.push({
    //     //       id: String(role.survey_id),
    //     //       type: "survey",
    //     //     });
    //     //   }
    //     //   if (role.org_id) {
    //     //     allOrgs.push({
    //     //       id: String(role.org_id),
    //     //       type: "org",
    //     //     });
    //     //   }
    //     //   allUsers.push({
    //     //     id: String(role.user_id),
    //     //     type: "user",
    //     //   });
    //     // });
    //     setState({
    //       users: allUsers,
    //       surveys: allSurveys,
    //       orgs: allOrgs,
    //       roleTypes: [],
    //       actions: allActions,
    //     });
    //   });
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

  let allEntities: any[] = ctx.orgs
    .concat((ctx.surveys as any[]).concat(ctx.users as any[]))
    .concat(ctx.actions as any[]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "scroll",
      }}
    >
      {allEntities.map(
        (item: OsoObject<"org" | "user" | "survey" | "action">) => (
          <Item
            value={item.value}
            label={item.label}
            type={item.type}
            color={CM[item.type]}
            isDropped={false}
            icon={IM[item.type]}
          ></Item>
        )
      )}
    </div>
  );
};

export const QueryPane = () => {
  let [output, setOutput] = React.useState(null);

  let [actorVal, setActorVal] = React.useState<string>(null);
  let [roleVal, setRoleVal] = React.useState<string>(null);
  let [resourceVal, setResourceVal] = React.useState<string>(null);

  React.useEffect(() => {
    console.log(actorVal, roleVal, resourceVal);
    console.log("fetching....");

    let actor = actorVal ? actorVal : "*";
    let role = roleVal ? roleVal : "*";
    let resource = resourceVal ? resourceVal : "*";
    // fetch(
    //   `http://localhost:9001/api/osotest/query2/${actor}/${role}/${resource}`
    // )
    //   .then((response) => response.json())
    //   .then((data) => {
    //     // setOutput(data);
    //     console.log(data);
    //   });

    if (actorVal && roleVal && resourceVal) {
      fetch(
        `http://localhost:9001/api/osotest/query/${actorVal}/${roleVal}/${resourceVal}`
      )
        .then((response) => response.json())
        .then((data) => {
          setOutput(data);
        });
    }
  }, [actorVal, roleVal, resourceVal]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div>
        <label>
          Actor:
          <SingleContainer
            color={(val: string) =>
              val in CM ? CM[val as ItemProps["type"]] : "pink"
            }
            onChange={(newVal) => {
              setActorVal(newVal);
            }}
            accepts={["user"]}
          ></SingleContainer>
        </label>
        <label>
          Action:
          <SingleContainer
            color={(val: string) =>
              val in CM ? CM[val as ItemProps["type"]] : "pink"
            }
            onChange={(newVal) => {
              setRoleVal(newVal);
            }}
            accepts={["action"]}
          ></SingleContainer>
        </label>
        <label>
          Resource
          <SingleContainer
            color={(val: string) =>
              val in CM ? CM[val as ItemProps["type"]] : "pink"
            }
            onChange={(newVal) => {
              setResourceVal(newVal);
            }}
            accepts={["survey", "org"]}
          ></SingleContainer>{" "}
        </label>
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

interface FGNode {
  id: string;
  label: string;
}

interface FGLink {
  source: string;
  target: string;
}

export const FG = () => {
  // const [dim, setDim] = React.useState({ w: 0, h: 0 });
  //
  // const containerRef = React.useRef(null);
  // const { width, height } = useContainerDimensions(containerRef);
  const { width, height, ref } = useResizeDetector();

  console.log(width, height);
  let ctx = useOsoInspectorContext();

  let allLinks: any[] = [];
  let allNodes: any[] = [];

  if (ctx) {
    ctx.roles.forEach((role: any) => {
      if (role.survey) {
        allLinks.push({
          source: String(role.survey),
          target: String(role.user),
          label: role.type,
        });

        allNodes.push({
          id: String(role.survey),
          label: ctx.surveys.find((s) => s.value === role.survey).label,
          type: "survey",
        });
      }
      if (role.organization) {
        allLinks.push({
          source: String(role.organization),
          target: String(role.user),
          label: role.type,
        });
        allNodes.push({
          id: String(role.organization),
          label: ctx.orgs.find((s) => s.value === role.organization).label,
          type: "organization",
        });
      }
      allNodes.push({
        id: String(role.user),
        label: ctx.users.find((s) => s.value === role.user).label,
        type: "user",
      });
    });
  }

  let data = {
    nodes: allNodes.filter((v, i, a) => a.map((n) => n.id).indexOf(v.id) === i),
    links: allLinks,
  };
  //     });

  // let w = 0;
  // let h = 0;
  // React.useEffect(() => {
  //   w = containerRef.current ? containerRef.current.offsetWidth : 0;
  //   h = containerRef.current ? containerRef.current.offsetHeight : 0;
  //   // setDim({ w, h });
  //   console.log('>>>', w,)
  // }, [containerRef]);

  return (
    <div
      style={{
        width: "90%",
        height: "90%",
        border: "solid 1px darkgray",
        overflow: "hidden",
      }}
      onClick={(e) => {
        console.log("!");
        e.stopPropagation();
      }}
      ref={ref}
    >
      <ForceGraph3D
        graphData={data}
        width={width - 2}
        height={height - 2}
        // height={600}
        nodeAutoColorBy="group"
        linkThreeObjectExtend={true}
        linkThreeObject={(link: any) => {
          // extend link with text sprite
          const sprite = new SpriteText(`${link.label}`);
          sprite.color = "lightgrey";
          sprite.textHeight = 1;
          return sprite;
        }}
        linkPositionUpdate={(sprite, { start, end }) => {
          const m = {
            x: start["x"] + (end["x"] - start["x"]) / 2,
            y: start["y"] + (end["y"] - start["y"]) / 2,
            z: start["z"] + (end["z"] - start["z"]) / 2,
          };
          Object.assign(sprite.position, m);
          return true;
        }}
        nodeThreeObject={(node: any) => {
          const sprite = new SpriteText(node.label);
          let cm: any = {
            user: "blue",
            survey: "orange",
            organization: "purple",
          };
          sprite.color = cm[node.type as string];
          sprite.textHeight = 3;
          return sprite;
        }}
      />
    </div>
  );
};
