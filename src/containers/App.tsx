import CoverBuilder from "./CoverBuilder";
import { h } from "preact";
import PostBuilder from "./PostBuilder";

export default function App() {
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
              <a href="#">Link</a>
            </li>
            <li>
              <a href="#">Link</a>
            </li>
            <li>
              <a href="#" role="button">
                Button
              </a>
            </li>
          </ul>
        </nav>
      </header>
      <main className="container">
        <PostBuilder />
        <CoverBuilder />
      </main>
    </div>
  );
}
