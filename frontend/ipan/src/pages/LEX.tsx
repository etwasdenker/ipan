import { useEffect, useState } from "react";
import { Card, CardContent, Typography, MenuItem, TextField, Box } from "@mui/material";
import { marked } from "marked";

const files = [
  { label: "README", path: "/lex/README.md" },
];

export default function LEX() {
  const [content, setContent] = useState("<p>Выберите документ</p>");
  const [file, setFile] = useState(files[0].path);

  useEffect(() => {
    fetch(file)
      .then((r) => r.text())
      .then(async (md) => {
        const html = await marked.parse(md);
        setContent(typeof html === "string" ? html : String(html));
      });
  }, [file]);

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
          <Typography variant="h6">LEX (документация)</Typography>
          <TextField select size="small" value={file} onChange={(e) => setFile(e.target.value)}>
            {files.map((f) => (
              <MenuItem key={f.path} value={f.path}>
                {f.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </CardContent>
    </Card>
  );
}
