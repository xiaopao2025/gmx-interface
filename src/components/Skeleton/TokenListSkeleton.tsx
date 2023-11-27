import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { SkeletonTheme } from "react-loading-skeleton";
import "./Skeleton.scss";

function TableRowSkeleton({ showAction }) {
  return (
    <tr>
      <td>
        <div className="items-center">
          <Skeleton className="mr-sm" height={40} width={40} circle />
          <div>
            <Skeleton width={60} height={12} />
            <Skeleton width={40} height={12} />
          </div>
        </div>
      </td>
      <td>
        <Skeleton width={60} count={1} />
      </td>
      <td>
        <Skeleton width={100} height={12} />
        <Skeleton width={80} height={12} />
      </td>
      <td>
        <Skeleton width={100} height={12} />
        <Skeleton width={80} height={12} />
      </td>
      <td>
        <Skeleton width={100} height={12} />
        <Skeleton width={80} height={12} />
      </td>
      {showAction && (
        <>
          <td>
            <Skeleton width={60} count={1} />
          </td>
          <td>
            <Skeleton width={150} inline count={2} className="mr-xs" />
          </td>
        </>
      )}
    </tr>
  );
}

function TokenListSkeleton({ count = 10, showAction = true }) {
  return (
    <SkeletonTheme baseColor="#B4BBFF1A" highlightColor="#B4BBFF1A">
      {Array.from({ length: count }).map((_, index) => (
        <TableRowSkeleton key={index} showAction={showAction} />
      ))}
    </SkeletonTheme>
  );
}
export default TokenListSkeleton;
