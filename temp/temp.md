# temp

mac 安装 python 问题

alias python2='/System/Library/Frameworks/Python.framework/Versions/2.7/bin/python2.7'
alias python3='/usr/local/Cellar/python@3.9/3.9.7_1'
alias python=python3

Mac 安装 python3，不污染默认 pyton

brew install python3
brew link python3

如果 link 出问题则：
$ sudo mkdir /usr/local/Frameworks
$ sudo chown $(whoami):admin /usr/local/Frameworks

.zshrc 添加
alias python=python3
alias pip=pip3

升级 pip
 pip3 -V
pip3 install --upgrade pip

brew 安装的 python 问题：https://blog.csdn.net/qq_43332010/article/details/122285805

pip install opencv-python==3.4.0.14 3.4.2 后存在有一些算法专利导致的无法使用问题。
安装失败解决办法：
pip3 install --upgrade setuptools pip
pip3 install opencv-python
继续安装 依赖
pip3 install opencv-contrib-python==3.4.11.45

重置 git 提交历史

0 准备
本地准备一份最新的 code

1 创建新分支：
git checkout --orphan clean
将最新的 code 复制进来
2 保存内容：
git add .
git commit -m “clean”
3 删除 master 分支
git branch -D master
4 修改当前分支为 master
git branch -m master
5 提交到远程
git push -f origin master
