import React, { useEffect, forwardRef } from "react";
import MaterialTable from "material-table";

import AddBox from "@material-ui/icons/AddBox";
import Edit from "@material-ui/icons/Edit";
import DeleteOutline from "@material-ui/icons/DeleteOutline";
import ArrowDownward from "@material-ui/icons/ArrowDownward";
import FirstPage from "@material-ui/icons/FirstPage";
import LastPage from "@material-ui/icons/LastPage";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import ChevronRight from "@material-ui/icons/ChevronRight";
import Check from "@material-ui/icons/Check";
import Clear from "@material-ui/icons/Clear";

const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => (
    <ChevronLeft {...props} ref={ref} />
  )),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
};

export default function MaterialTableDemo({
  tableTitle,
  tableColumn,
  tableRowsData,
  handleRowUpdate,
  handleRowDelete,
  handleRowAdd,
}) {
  const [state, setState] = React.useState({
    columns: [],
    data: [],
  });

  useEffect(() => {
    setState({ columns: tableColumn, data: tableRowsData, title: tableTitle });
  }, [tableColumn, tableRowsData, tableTitle]);

  return (
    <MaterialTable
      icons={tableIcons}
      options={{
        search: false,
      }}
      style={{ maxWidth: "95%", margin: "0 auto" }}
      title={state.title}
      columns={state.columns}
      data={state.data}
      editable={{
        onRowAdd: (newData) =>
          new Promise((resolve, reject) => {
            setTimeout(async () => {
              try {
                resolve();
                const dataRowDB = await handleRowAdd(newData);
                setState((prevState) => {
                  const data = [...prevState.data];
                  data.push(dataRowDB);
                  return { ...prevState, data };
                });
              } catch (error) {
                reject(error);
              }
            }, 600);
          }),
        onRowUpdate: (newData, oldData) =>
          new Promise((resolve, reject) => {
            setTimeout(async () => {
              try {
                resolve();
                const dataRowDB = await handleRowUpdate(newData);
                // console.log({ dataRowDB });
                if (oldData && dataRowDB) {
                  setState((prevState) => {
                    const data = [...prevState.data];
                    data[data.indexOf(oldData)] = newData;
                    return { ...prevState, data };
                  });
                }
              } catch (error) {
                reject(error);
              }
            }, 600);
          }),
        onRowDelete: (oldData) =>
          new Promise((resolve, reject) => {
            setTimeout(async () => {
              try {
                resolve();
                await handleRowDelete(oldData);
                setState((prevState) => {
                  const data = [...prevState.data];
                  data.splice(data.indexOf(oldData), 1);
                  return { ...prevState, data };
                });
              } catch (error) {
                reject();
              }
            }, 600);
          }),
      }}
    />
  );
}
