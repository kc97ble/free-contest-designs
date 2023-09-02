import CoverBuilder from "../CoverBuilder";
import { h } from "preact";
import PostBuilder from "../PostBuilder";
import { useHash } from "./hooks";

export default function App() {
  const hash = useHash();
  console.log({ hash });

  return (
    <div>
      <header className="container">
        <nav>
          <ul>
            <li>
              <strong>{"FC Design Builder"}</strong>
            </li>
          </ul>
          <ul>
            <li>
              <a href="#">{"Home"}</a>
            </li>
            <li>
              <a href="#post">{"Post Builder"}</a>
            </li>
            <li>
              <a href="#cover">{"Cover Builder"}</a>
            </li>
          </ul>
        </nav>
      </header>
      <main className="container">
        {(() => {
          switch (hash) {
            case "#post":
              return <PostBuilder />;
            case "#cover":
              return <CoverBuilder />;
            default:
              return undefined;
          }
        })()}
      </main>
    </div>
  );
}
