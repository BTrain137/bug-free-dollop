import React, { useState, useEffect } from "react";
import axios from "axios";

import MaterialTable from "../../components/Table";

const Store = () => {
  const [tableRowsData, setTableRowsData] = useState([]);

  const tableColumn = [
    { title: "S & D Order", field: "order_number", type: "numeric" },
    { title: "Item", field: "item_title" },
    { title: "Cost", field: "cost" },
    { title: "Variant Id", field: "variant_id", },
  ];

  useEffect(() => {
    const getCommissionsPayout = async () => {
      const reqBody = {
        url: "/api/s-and-d/all",
        method: "GET",
      };

      const {
        data
      } = await axios(reqBody);
      setTableRowsData(data);
    };
    getCommissionsPayout();
  }, []);

  const handleRowAdd = async (rowData) => {
    const reqBody = {
      url: "/api/admin/commissions/payout",
      method: "POST",
      data: {
        rowData,
      },
    };

    const {
      data: { tableRowData },
    } = await axios(reqBody);

    return tableRowData;
  };

  const handleRowUpdate = async (rowData) => {
    const reqBody = {
      url: "/api/admin/commissions/payout",
      method: "PUT",
      data: {
        rowData,
      },
    };

    const {
      data: { tableRowData },
    } = await axios(reqBody);

    return tableRowData;
  };

  const handleRowDelete = async (rowData) => {
    const reqBody = {
      url: "/api/admin/commissions/payout",
      method: "DELETE",
      data: {
        rowData,
      },
    };

    await axios(reqBody);

    return true;
  };

  return (
    <>
        {tableRowsData.length ? (
          <MaterialTable
            tableTitle="Surprise and Delight"
            tableRowsData={tableRowsData}
            tableColumn={tableColumn}
            handleRowUpdate={handleRowUpdate}
            handleRowDelete={handleRowDelete}
            handleRowAdd={handleRowAdd}
          />
        ) : null}
    </>
  );
};

export default Store;
