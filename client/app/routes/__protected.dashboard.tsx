import { useOutletContext } from "react-router";

export default function Dashboard() {
  const { user } = useOutletContext<{ user: any }>();
  return <div>Olá {user.name}</div>;
}
