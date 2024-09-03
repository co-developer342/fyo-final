import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminMenu from "../../components/Layout/AdminMenu";
import Layout from "../../components/Layout/Layout";
import { useToast } from "@chakra-ui/react";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Function to get the current user's email from local storage
  const getCurrentUserEmail = () => {
    const authData = JSON.parse(localStorage.getItem("auth"));
    return authData && authData.user ? authData.user.email : null;
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/v1/auth/all-users");
      const currentUserEmail = getCurrentUserEmail();

      // Filter out the current user by email
      const filteredUsers = response.data.users.filter(user => user.email !== currentUserEmail);

      setUsers(filteredUsers);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users", error);
      setLoading(false);
      toast({
        title: 'Error fetching users',
        description: "There was an error fetching the user data.",
        status: 'error',
        duration: 2000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  const deleteUser = async (id) => {
    try {
      await axios.delete(`/api/v1/auth/delete-user/${id}`);
      setUsers(users.filter(user => user._id !== id));
      toast({
        title: 'User Deleted',
        description: "The user has been successfully deleted.",
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top-right',
      });
    } catch (error) {
      console.error("Error deleting user", error);
      toast({
        title: 'Error Deleting User',
        description: "There was an error deleting the user.",
        status: 'error',
        duration: 2000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <Layout title={"Dashboard - All Users"}>
      <div className="container-fluid m-3 p-3">
        <div className="row">
          <div className="col-md-3">
            <AdminMenu />
          </div>
          <div className="col-md-9">
            <h1>All Users</h1>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.phone}</td>
                      <td>{user.address}</td>
                      <td>
                        <button
                          className="btn btn-danger"
                          onClick={() => deleteUser(user._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Users;
