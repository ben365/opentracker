# opentracker

An open car GPS tracker using OpenStreetMap.

## How to use

```
  virtualenv -p python2 venv
  source venv/bin/activate
  pip install -r requirements.txt
  python main.py
```
Then go to http://127.0.0.1:8000

Python file must be modified to be used with a real GPS receiver (change /getPos implementation which is actually a simulation).
