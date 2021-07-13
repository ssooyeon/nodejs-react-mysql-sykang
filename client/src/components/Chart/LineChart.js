import React from "react";
import { Line } from "react-chartjs-2";
import "chartjs-plugin-streaming";

export default function LinChart({ data, legend, options }) {
  // const LineChart = ({ data, legend, options }) => {
  return <Line data={data} legend={legend} options={options} height={300} />;
}

/**
 * Memo
 *  - 컴포넌트의 props(여기서 data,legend,options)가 바뀌지 않았으면 리랜더링을 하지 않음
 *  - 같은 props로 렌더링이 자주 일어나는 컴포넌트에 적합
 *  - 일반적으로 부모 컴포넌트에 의해 하위 컴포넌트가 같은 props로 리랜더링 될 떄가 있음
 */
// export default React.memo(LineChart);
