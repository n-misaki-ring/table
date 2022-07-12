import React, { ReactNode, useEffect, useMemo, useState } from "react";
import "./App.css";

export type Data = any;
export type DataSource = { [KEY in string]: Data };

type Column = {
  key: string;
  title: ReactNode;
  render?: (data: Data) => ReactNode;
};

type Props = {
  columns: Column[];
  dataSources: DataSource[];
  checkboxSelection?: boolean;
  isNoView?: boolean;
  pageSize?: number;
  onChangeCheck?: (dataSource: DataSource[]) => void;
};

function Table(props: Props) {
  const {
    columns,
    dataSources,
    checkboxSelection = false,
    isNoView = false,
    pageSize = 10,
  } = props;

  const [currentPage, setCurrentPage] = useState(0);
  const pageMax = Math.ceil(dataSources.length / pageSize);
  const [checked, setChecked] = useState<number[]>([]);

  /**
   * 全チェック判定
   */
  const allCheck = useMemo(() => {
    const start = currentPage * pageSize;
    const end = Math.min(dataSources.length, currentPage * pageSize + pageSize);
    return Array.from(Array(end - start).keys())
      .map((index) => start + index)
      .every((index) => checked.includes(index));
  }, [checked]);

  /**
   * チェックイベント
   * @param isCheck
   * @param dataIndex
   */
  const onChangeCheck = (isCheck: boolean, dataIndex: number) => {
    const start = currentPage * pageSize;
    const end = Math.min(dataSources.length, currentPage * pageSize + pageSize);
    const data =
      dataIndex === -1
        ? Array.from(Array(end - start).keys()).map((index) => start + index)
        : [dataIndex];
    setChecked((current) =>
      isCheck
        ? Array.from(new Set([...current, ...data]))
        : current.filter((item) => !data.includes(item))
    );
  };

  /**
   * チェック変更通知イベント
   */
  useEffect(() => {
    props?.onChangeCheck?.call(
      null,
      checked.map((index) => dataSources[index])
    );
  }, [checked]);

  return (
    <>
      <p>データ件数：{dataSources.length}</p>
      <p>表示件数：{pageSize}</p>
      <p>ページ数：{pageMax}</p>
      <p>現在のページ：{currentPage}</p>
      <p>選択中：{JSON.stringify(checked)}</p>

      <table>
        <tr>
          {checkboxSelection && (
            <th>
              <input
                type={"checkbox"}
                checked={allCheck}
                onChange={(e) => {
                  onChangeCheck(e.target.checked, -1);
                }}
              />
            </th>
          )}
          {isNoView && <th>#</th>}
          {columns.map((headerColumn) => (
            <th key={headerColumn.key}>{headerColumn.title}</th>
          ))}
        </tr>
        {dataSources
          .slice(currentPage * pageSize, currentPage * pageSize + pageSize)
          .map((dataSource, dataIndex) => (
            <tr>
              {checkboxSelection && (
                <td>
                  <input
                    type={"checkbox"}
                    checked={checked.includes(
                      currentPage * pageSize + dataIndex
                    )}
                    onChange={(e) => {
                      onChangeCheck(
                        e.target.checked,
                        currentPage * pageSize + dataIndex
                      );
                    }}
                  />
                </td>
              )}
              {isNoView && <td>{currentPage * pageSize + dataIndex + 1}</td>}
              {columns.map((dataColumn) => (
                <td>
                  {dataColumn.render
                    ? dataColumn.render(dataSource[dataColumn.key])
                    : dataSource[dataColumn.key]}
                </td>
              ))}
            </tr>
          ))}
      </table>
      <ul>
        {Array.from(Array(pageMax).keys()).map((index) => (
          <li key={`p-${index}`} onClick={setCurrentPage.bind(null, index)}>
            <span className={index === currentPage ? "active" : ""}>
              {index + 1}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

export default Table;
