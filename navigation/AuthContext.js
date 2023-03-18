// import { Auth, API, graphqlOperation } from "aws-amplify";
import { createContext, useState, useContext, useEffect } from "react";
// import { getStreamToken } from "../graphql/queries";
//import { Alert } from "react-native";
// import { useSelector } from "react-redux";

const AuthContext = createContext({
    userId: null,
    setUserId: (newId) => {},
  });
  
//children are automatically passed when you have <AuthContext> tab <View> for example View is children
const AuthContextComponent = ({ children, client }) => {
  const [userId, setUserId] = useState(null);



  return (
    <AuthContext.Provider value={{ userId, setUserId }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextComponent;

export const useAuthContext = () => useContext(AuthContext);