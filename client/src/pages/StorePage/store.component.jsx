import React, { useState, useEffect } from "react";
import axios from "axios";

import MaterialTable from "../../components/Table";

import { cleanDeliveryDays } from "../../utils/cleanData";

const Store = () => {
  const [tableRowsData, setTableRowsData] = useState([]);

  const tableColumn = [
    { title: "ID", field: "id", type: "numeric", editable: "never" },
    { title: "Store ID", field: "store-id" },
    { title: "Store", field: "store" },
    { title: "Delivery Days", field: "delivery-days", },
    { title: "DB ID", field: "db-id", },
    { title: "State", field: "state", },
  ];

  useEffect(() => {
    const getCommissionsPayout = async () => {
      const reqBody = {
        url: "/api/store/all",
        method: "GET",
      };

      const {
        data
      } = await axios(reqBody);
      const cleanData = cleanDeliveryDays(data);
      setTableRowsData(cleanData);
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
            tableTitle="Store Map"
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
