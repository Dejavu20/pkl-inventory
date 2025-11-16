import React, { useEffect } from "react";
import Layout from "./Layout";
import BorrowingList from "../components/BorrowingList";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getMe } from "../features/authSlice";

const Borrowings = () => {
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
        <BorrowingList />
      </div>
    </Layout>
  );
};

export default Borrowings;
