import webbrowser
import os

filename = 'file:///' + os.getcwd() + '/' + 'index.html'
webbrowser.open_new_tab(filename)
