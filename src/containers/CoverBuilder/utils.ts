export function parseSource(source: string) {
  const [firstLine = "", ...otherLines] = source.split("\n");
  const [title_top = "", title_main = ""] = firstLine.split(",");
  const title = { top: title_top, main: title_main };
  const items = otherLines.map((line) => {
    const [top = "", main = "", right = ""] = line.split(",");
    return { top, main, right };
  });
  return { title, items };
}
