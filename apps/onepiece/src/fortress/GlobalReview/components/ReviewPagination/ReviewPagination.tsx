import LeftArrow from 'fortress/GlobalReview/icon/left-arrow';
import RightArrow from 'fortress/GlobalReview/icon/right-arrow';
import * as React from 'react';
import ReactPaginate from 'react-paginate';
import { styled } from '@mui/joy';

const PaginationWrapper = styled('div')`
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0;
    padding: 0;
    list-style: none;
    margin-top: 50px;
  }
  .prevBtn {
    a {
      border: 1px solid transparent;
      background-color: transparent;
      width: 38px;
      height: 38px;
      line-height: 38px;
      margin: 0 5px;
      text-align: center;
      border-radius: 0;
      padding: 0;
      color: #c1af86;
      display: flex;
      align-items: center;
      svg {
        stroke: #c1af86;
        fill: #c1af86;
      }
      svg:hover {
        stroke: #995334;
        fill: #995334;
      }
    }
  }
  .disabled {
    display: none;
  }
  .nextBtn {
    a {
      border: 1px solid transparent;
      background-color: transparent;
      width: 38px;
      height: 38px;
      line-height: 38px;
      margin: 0 5px;
      text-align: center;
      border-radius: 0;
      padding: 0;
      color: #c1af86;
      display: flex;
      align-items: center;
      svg {
        stroke: #c1af86;
        fill: #c1af86;
      }
      svg:hover {
        stroke: #995334;
        fill: #995334;
      }
    }
  }
  .isActive {
    .btn {
      cursor: default;
      background-color: #a45b37;
      border-color: #a45b37;
      color: #dbcfb5;
    }
  }
  li > a {
    border: 1px solid transparent;
    background-color: transparent;
    width: 38px;
    height: 38px;
    line-height: 38px;
    margin: 0 5px;
    text-align: center;
    border-radius: 0;
    padding: 0;
    color: #c1af86;
  }
  li > a:hover {
    color: #995334;
  }
  .breakMe {
    a {
      a {
        color: #c1af86;
      }
    }
  }
`;

type ReviewPaginationProps = {
  onCurrentPageChange: (page: number) => void;
  pageCount: number;
  currentPage: number;
};

const ReviewPagination = ({ onCurrentPageChange, pageCount, currentPage }: ReviewPaginationProps) => {
  return (
    <PaginationWrapper>
      <ReactPaginate
        previousLabel={<LeftArrow />}
        nextLabel={<RightArrow />}
        // TODO @carl-zhang111 这里不能使用 a 标签，因为 a 标签不能嵌套 a 标签
        breakLabel={
          <a className="btn" href="">
            ...
          </a>
        }
        breakClassName="breakMe"
        forcePage={currentPage - 1}
        pageCount={pageCount}
        marginPagesDisplayed={2}
        pageRangeDisplayed={2}
        onPageChange={(i: { selected: number }) => {
          onCurrentPageChange(i.selected + 1);
        }}
        containerClassName="pagination"
        pageLinkClassName="btn"
        activeClassName="isActive"
        previousClassName="prevBtn"
        previousLinkClassName="btn"
        nextClassName="nextBtn"
        nextLinkClassName="btn"
      />
    </PaginationWrapper>
  );
};

export default ReviewPagination;
