import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useParams,
  Outlet,
} from "./libs";
import ResizeObservable from "./Resize";

export default function App() {
  return (
    <BrowserRouter basename="/">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/article/:id" element={<Article />} />
        <Route path="/about" element={<About />}>
          <Route path="/:name" element={<People />} />
        </Route>
        <Route path="/contact" element={<Contact />} />
        <Route element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

function Home() {
  const navigate = useNavigate();
  return (
    <ResizeObservable onResize={console.log}>
      <h1>Welcome to the Home page!</h1>
      <ol>
        <li>
          <button onClick={() => navigate("about/jim")}>About</button>
        </li>
        <li>
          <button onClick={() => navigate("contact")}>Contact</button>
        </li>
        <li>
          <button onClick={() => navigate("article/who are you")}>
            Article
          </button>
        </li>
      </ol>
    </ResizeObservable>
  );
}

function About() {
  const navigate = useNavigate();
  return (
    <>
      <h1 onClick={() => navigate(-1)}>About Us</h1>
      <Outlet />
    </>
  );
}

function People() {
  const { name } = useParams();
  return <h1>People: {`${name}`}</h1>;
}

function Contact() {
  const navigate = useNavigate();

  return (
    <h1 onClick={() => navigate("..", { relative: "path" })}>Contact Us</h1>
  );
}

function NotFound() {
  return <h1>404 Not Found</h1>;
}

function Article() {
  const { id } = useParams();

  return (
    <>
      <h1>Article</h1>
      <p>{id}</p>
    </>
  );
}
