import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react";
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
  fixedColumns?: string[];
  onChangeCheck?: (dataSource: DataSource[]) => void;
};

function Table(props: Props) {
  const {
    columns,
    dataSources,
    checkboxSelection = false,
    isNoView = false,
    pageSize = 10,
    fixedColumns = [],
  } = props;

  const [currentPage, setCurrentPage] = useState(0);
  const pageMax = Math.ceil(dataSources.length / pageSize);
  const [checked, setChecked] = useState<number[]>([]);
  const tableRef = useRef<HTMLTableElement>(null);
  /**
   * 全チェック判定
   */
  const allCheck = useMemo(() => {
    const start = currentPage * pageSize;
    const end = Math.min(dataSources.length, currentPage * pageSize + pageSize);
    return Array.from(Array(end - start).keys())
      .map((index) => start + index)
      .every((index) => checked.includes(index));
  }, [checked, currentPage, pageSize, dataSources.length]);

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

  useEffect(() => {
    if (fixedColumns.length) {
      Array.from(tableRef.current?.getElementsByTagName("tr") || []).forEach(
        (tr: HTMLTableRowElement) => {
          const fixedElements = Array.from(
            tr.getElementsByClassName("fixed")
          ) as HTMLElement[];
          let offset = 0;
          fixedElements.forEach((fixedElement) => {
            fixedElement.style.left = `${offset}px`;
            offset += fixedElement.clientWidth + 4;
          });
        }
      );
    }
  }, []);

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

      <table ref={tableRef}>
        <thead>
          <tr>
            {checkboxSelection && (
              <th className={fixedColumns.includes("checkbox") ? "fixed" : ""}>
                <input
                  type={"checkbox"}
                  checked={allCheck}
                  onChange={(e) => {
                    onChangeCheck(e.target.checked, -1);
                  }}
                />
              </th>
            )}
            {isNoView && (
              <th className={fixedColumns.includes("#") ? "fixed" : ""}>#</th>
            )}
            {columns.map((headerColumn) => (
              <th
                key={headerColumn.key}
                className={
                  fixedColumns.includes(headerColumn.key) ? "fixed" : ""
                }
              >
                {headerColumn.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataSources
            .slice(currentPage * pageSize, currentPage * pageSize + pageSize)
            .map((dataSource, dataIndex) => (
              <tr key={`cell-${dataIndex}`}>
                {checkboxSelection && (
                  <td
                    className={fixedColumns.includes("checkbox") ? "fixed" : ""}
                  >
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
                {isNoView && (
                  <td className={fixedColumns.includes("#") ? "fixed" : ""}>
                    {currentPage * pageSize + dataIndex + 1}
                  </td>
                )}
                {columns.map((dataColumn, columnIndex) => (
                  <td
                    key={`cell-${dataIndex}-${columnIndex}`}
                    className={
                      fixedColumns.includes(dataColumn.key) ? "fixed" : ""
                    }
                  >
                    {dataColumn.render
                      ? dataColumn.render(dataSource[dataColumn.key])
                      : dataSource[dataColumn.key]}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
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
