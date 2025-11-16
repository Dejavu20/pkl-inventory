import React, { useEffect } from "react";
import Layout from "./Layout";
import BorrowingHistoryList from "../components/BorrowingHistoryList";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getMe } from "../features/authSlice";

const BorrowingHistory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isError } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    if (isError) {
      navigate("/");
    }
  }, [isError, navigate]);

  return (
    <Layout>
      <div style={{ padding: "0.5rem" }}>
        <BorrowingHistoryList />
      </div>
    </Layout>
  );
};

export default BorrowingHistory;

