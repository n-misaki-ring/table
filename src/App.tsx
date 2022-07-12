import React, { useState } from "react";
import "./App.css";
import Table, { Data, DataSource } from "./Table";
import dayjs from "dayjs";

function App() {
  const CustomTag = ({ children }: any) => (
    <>
      <p>{children}</p>
    </>
  );

  /**
   * ヘッダーの定義
   */
  const columns = [
    {
      key: "id",
      title: "ID",
    },
    {
      key: "title",
      title: <b>タイトル</b>,
    },
    {
      key: "category",
      title: "カテゴリ",
    },
    {
      key: "test",
      title: "テスト",
      render: (data: Data) => <CustomTag>{data}</CustomTag>,
    },

    {
      key: "created",
      title: "作成日時",
      render: (data: Data) => dayjs(data).format("YYYY-MM-DD"),
    },
  ];

  /**
   * テーブルデータ
   */
  const dataSources: DataSource[] = [];

  for (let i = 1; i <= 102; i++) {
    dataSources.push({
      id: i,
      title: `タイトル${i}`,
      category: `カテゴリー${i}`,
      test: "てすと",
      created: new Date(),
    });
  }

  const onChangeCheck = (dataSource: DataSource[]) => {
    console.log(dataSource);
  };

  return (
    <div className="App">
      <Table
        columns={columns}
        dataSources={dataSources}
        checkboxSelection={true}
        isNoView={true}
        pageSize={10}
        fixedColumns={["checkbox", "#"]}
        onChangeCheck={onChangeCheck}
      />
    </div>
  );
}

export default App;
