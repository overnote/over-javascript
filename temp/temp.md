# temp

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
