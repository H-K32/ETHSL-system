import codecs
p=r'C:\Users\User\Documents\GitHub\ETHSL-system\backend\EthSL\requirements.txt'
with open(p,'rb') as f:
    b=f.read()
enc='utf-8'
if b.startswith(codecs.BOM_UTF16_LE) or b.startswith(codecs.BOM_UTF16_BE):
    enc='utf-16'
s=b.decode(enc)
if 'reportlab' not in s:
    if not s.endswith('\n'):
        s += '\n'
    s += 'reportlab\n'
    with open(p,'w',encoding=enc) as f:
        f.write(s)
    print('APPENDED')
else:
    print('ALREADY_PRESENT')
