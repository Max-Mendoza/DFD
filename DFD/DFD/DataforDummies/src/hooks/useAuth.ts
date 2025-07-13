
import { AuthContext } from "@/context/AuthContext";
import { useContext } from "react";


export function useAuth() {
  const context = useContext(AuthContext)
  if(!context){
    throw new Error('AuthContext must not be undefinied or used with an Authprovider')
  }
  return context;
}
