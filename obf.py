import tkinter as tk;from tkinter import filedialog,messagebox;import base64 as b64

def obfuscate_html(h):
    o=b64.b64encode(h.encode('utf-8')).decode('utf-8')
    return f"<script>document.write(decodeURIComponent(escape(window.atob('{o}'))))</script>"

def open_file():
    p=filedialog.askopenfilename(filetypes=[("HTML files","*.html"),("All files","*.*")],title="Open HTML file")
    if p:
        with open(p,'r',encoding='utf-8') as f:
            c=f.read()
        return c
    return None

def save_to_file(o):
    n=filedialog.asksaveasfilename(defaultextension=".html",filetypes=[("HTML files","*.html"),("All files","*.*")],title="Save obfuscated HTML as")
    if n:
        with open(n,'w',encoding='utf-8') as f:
            f.write(o)

class HTMLOBfuscatorApp:
    def __init__(self,r):
        self.r=r;self.r.title("HTML Obfuscator")
        self.b1=tk.Button(r,text="Open HTML File",command=self.open_html_file)
        self.b1.pack(pady=20)
        self.b2=tk.Button(r,text="Obfuscate and Save",command=self.obfuscate_and_save)
        self.b2.pack(pady=20)
        self.h=None
        
    def open_html_file(self):
        self.h=open_file()
        if self.h:
            messagebox.showinfo("Success","HTML file loaded successfully!")
        else:
            messagebox.showwarning("Warning","Failed to load HTML file.")
    
    def obfuscate_and_save(self):
        if self.h:
            o=obfuscate_html(self.h)
            save_to_file(o)
        else:
            messagebox.showwarning("Warning","No HTML content to obfuscate. Please open an HTML file first.")

if __name__ == "__main__":
    r=tk.Tk();a=HTMLOBfuscatorApp(r);r.mainloop()
