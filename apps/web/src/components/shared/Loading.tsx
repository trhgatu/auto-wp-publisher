import { Spin } from "antd";

interface LoadingProps {
  tip?: string;
  fullPage?: boolean;
  height?: number | string;
}

export const Loading = ({
  tip = "Đang tải dữ liệu...",
  fullPage = false,
  height = 320,
}: LoadingProps) => {
  if (fullPage) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#F6F7FB]/80 dark:bg-[#141414]/80 backdrop-blur-sm animate-in fade-in duration-300">
        <Spin
          size="large"
          tip={
            <span className="text-[#C62828] font-bold mt-4 block">{tip}</span>
          }
        />
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-center w-full animate-in fade-in duration-300"
      style={{ height }}
    >
      <Spin
        size="large"
        tip={<span className="text-[#C62828] font-bold mt-2 block">{tip}</span>}
      />
    </div>
  );
};
export default Loading;
