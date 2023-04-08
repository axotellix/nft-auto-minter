#--- [ IMPORTS ] ----------
import pyautogui
import win32gui, win32com.client
import pythoncom
import sys
import os
import time
import logging
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler


#--- [ FUNCTIONS ] ----------
 # show > Planet VPN window (put on top)
def getAppWin( app ):

    def windowEnumerationHandler(hwnd, top_windows):
        top_windows.append((hwnd, win32gui.GetWindowText(hwnd)))

    top_windows = []
    win32gui.EnumWindows(windowEnumerationHandler, top_windows)
    for i in top_windows:
        if app in i[1]:
            win32gui.ShowWindow(i[0],5)
            shell = win32com.client.Dispatch("WScript.Shell", pythoncom.CoInitialize())
            shell.SendKeys('%')
            win32gui.SetForegroundWindow(i[0])
            rect = win32gui.GetWindowRect(i[0])
            time.sleep(0.2)
            return rect
            break

 # handle > create file event ("change ip" signal)
def on_created( event ):
    file_full_path = event.src_path
    start = event.src_path.rfind("\\") + 1
    file = event.src_path[start:]

    if file == "change-ip.txt":
        print("changing ip ...")

        # put > Planet VPN window on top | get > coords
        app_win = getAppWin("Planet VPN")

        # define > Planet VPN window coords
        x = app_win[0]
        y = app_win[1]

        # define > select server button coords
        select_server_x = x + 180
        select_server_y = y + 610

        # click > open select server screen
        pyautogui.click(select_server_x, select_server_y)

        # define > list of servers
        servers = [
            "France - Free",
            "Germany - Free",
            "Netherlands - Free",
            "USA - Free",
            "United Kingdom - Free"
        ]

        # read > file (get server name)
        with open(file_full_path, encoding="utf-8") as f:
            server = f.read()

        # define > select server button coords
        server_x = x + 170
        server_y = y + 150 + 35 * servers.index(server)

        # click > select server button
        time.sleep(0.2)
        pyautogui.click(server_x, server_y)
        os.remove(file_full_path)
        print(" - complete: change IP")
        print(" ")


#--- [ MAIN ] ----------
if __name__ == "__main__":

    # define > watchdog event handlers
    event_handler = FileSystemEventHandler()
    event_handler.on_created = on_created

    # setup > watchdog observer
    observer = Observer()
    path = "full_path/mint/ip-manager"
    observer.schedule(event_handler, path, recursive=False)

    # run > watchdog (listen for "change ip" signal)
    observer.start()
    try:
        print("IP manager is running ...")
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    finally:
        observer.stop()
        observer.join()