---
title: 高数基础题整理（三十讲）
description: 二轮复习基础三十讲题目整理；来自 ExamFor2027/Math/Analysis。
---

← [数学 · 科目地图](/knowledge/math/overview/) · 下一篇 → [占位专题](/knowledge/math/chapters/01-placeholder/)

> 源文件：`ExamFor2027/Math/Analysis/analysis_basic_problem.markdown`。答案默认收起，点击展开。

## 高等数学篇

备注：笔者仅为了整理二轮复习时所需要用到的基础三十讲的题目。

### 函数极限与连续

#### Page 69 例1.12

设$y = sinx, 0 \le x \le 2\pi$,求其所有单调区间上的反函数。

>  烦人的根号别着急泰勒展开，可以考虑有理化



常用的不定式
$$
x - ln(1+x) \sim \frac{1}{2}x^2
$$


### 数列极限

$$
\text{设} 0<a_n< \frac{\pi}{2} , 0<b_n< \frac{\pi}{2} ,cos(a_n) - a_n = cos(b_n) ,
	\lim_{n \to \infty} b_n = 0, \\\text{求} \lim_{n \to \infty} a_n,\lim_{n \to \infty} \frac{a_n}{{b_n}^2}.
$$

> 提示：考虑夹逼定理以及——在出现平方和余弦的时候关联:

$$
1 - cosx \sim \frac{1}{2}x^2
$$


<details class="answer-box">
<summary>点击展开答案</summary>

0,1/2.

</details>


可以详细解决一下脱帽法的问题（即极限和函数的保号性问题
$$
f(x) \text{连续且}\lim_{x \to 0^+}\frac{f(x)}{x} \text{存在，则推出}f(0) = 0?\text{为什么？}
$$


### 一元函数的微分学




$$
\text{设}f(x) = \frac{1}{2^x + 1} ,x \in R , \quad \text{求} f^{(4)}(0).
$$

<details class="answer-box">
<summary>点击展开答案</summary>

（尚未填写）

</details>




#### 163页的习题3.9



设 $ \delta > 0$，函数 $f(x)$ 在区间 $[-\delta , +\delta ]$ 上有定义，且  
$$
f(0) = 1,
$$
并满足  
$$
\lim_{x \to 0} \frac{\ln(1-2x) + 2x f(x)}{x^2} = 0.
$$

证明：$f(x)$ 在 $x=0$ 处可导，并求 $f'(0)$。

> 当出现一个莫名其妙的对数或者指数这类情况时，又没办法直接使用等价无穷小，不妨考虑一下泰勒展开，展开到二次项即可。

#### 求导专题

1. $( ln|x|)' = \frac{1}{x}$ 可无视绝对值。



求高阶导数的三种主要方法

1. 归纳法（逐次求导得出通式）
2. 莱布尼兹公式
3. 泰勒展开（通过泰勒式的唯一性对比系数求出高阶导的值）



#### 216页例6.4

$$
f(x) \text{在}[0,3]\text{上连续，}(0,3)\text{内可导，}f(0) + f(1) + f(2) = 3, f(3) = 1.
\\
\text{证明：存在}\xi \in (0,3) ,f'(\xi) = 0
$$

> 关键：找两个相等的函数值。

#### Page 218 例6.10

函数$f(x)$ 有$f(0) = 0$， 且当$x > 0$时，$f(x) < 0$，$f'(x) < 0$，$f''(x) > 0$，讨论当$0 < a < x < b$时，

函数
$$
\frac{f(x)}{x}
$$
的单调性。



### 一元函数积分

#### Page 243 例8.2

$$
\text{函\text{数}}f(x) = 

\begin{cases}
 \dfrac{1}{\sqrt{1 + x^2}} , &x \le 0 \\
  (x+1)cosx, &x > 0
\end{cases} \quad \text{的\text{一个原函数是？}}
$$

> 此题注意原函数的连续性

#### Page 260 例8.10

设$M = \int_0^{\frac{\pi}{2}}sin(sinx)dx,N = \int_0^{\frac{\pi}{2}}cos(cosx)dx$，判断$N,M,1$的大小关系。



一个重要技巧：
$$
\int_0^{\frac{\pi}{2}}f(sinx)dx = \int_0^{\frac{\pi}{2}}f(cosx)dx
$$

<details class="answer-box">
<summary>点击展开答案</summary>

$M < 1  < N$

</details>


#### Page 268-269 例8.15，例8.17（反常积分判断和计算）

设$a > b > 0$，反常积分
$$
\int_0^{\infty}\dfrac{1}{x^{a} + x^{b}}dx
$$
收敛，则 求a和b的取值范围。


<details class="answer-box">
<summary>点击展开答案</summary>

a > 1 and b < 1

</details>




变限积分的求导

设$F(x) = \int_{\varphi_1(x)}^{\varphi_2(x)}f(t)dt$，$f(x)$在$\left[ a, b \right]$上连续，可导函数$\varphi_1(x),\varphi_2(x)$的值域在$\left[ a, b \right]$上，则在他们的公共定义域上有：
$$
F'(x) = \dfrac{d}{dx}\left[ \int_{\varphi_1(x)}^{\varphi_2(x)}f(t)dt \right] = f\left [ \varphi_2(x) \right]\varphi_2'(x) - f\left [ \varphi_1(x) \right]\varphi_1'(x)
$$

#### Page 294 例9.14，9.15 arcsin(P(x))的计算

计算
$$
\int_0^1 \arcsin{\sqrt{1 - x^2}}dx , \int_0^1 x \arcsin{\sqrt{4x - 4x^2}}dx , 
$$

<details class="answer-box">
<summary>点击展开答案</summary>

$1,\; 1/2$

</details>
> 1考虑分布积分或者三角的换元，2考虑三角的换元（结合1的结果一同计算）

### 多元函数微分学

#### Page 363 例13.12 全微分计算

若函数$z = z(x,y)$由方程$e^{x+2y+3z} +xyz = 1$确定，则$dz|_{(0,0)} = $ ?


<details class="answer-box">
<summary>点击展开答案</summary>

-1/3dx-2/3dy

</details>


### 二重积分

#### Page 398 例14.13

$$
\lim_{x \to +\infty}\dfrac{\int_0^{x}t^2e^{x^2-t^2}dt + ae^x}{x^b} = -\dfrac{1}{2}
$$

求$a,b$的值


<details class="answer-box">
<summary>点击展开答案</summary>

$-\dfrac{\sqrt{\pi}}{4},1$

</details>




### 微分方程

一阶线性非齐次方程：

解为
$$
y = e^{-\int P(x)dx}\left (  \int e^{\int P(x) dx} Q(x) dx + C\right)
$$


伯努利方程：
$$
\frac{dy}{dx} + p(x)y = q(x)y^n
$$
常系数微分方程
$$
\text{常系数微分方程：}y'' + py' +qy = 0\\
\text{对应特征方程为：}r^2 + pr+q = 0\\
\text{如果}r_1,r_2\text{为不等实根}(r_1 \neq r_2)\text{，则通解为：}y = C_1e^{r_1x}+C_2e^{r_2x}\\
\text{如果}r_1=r_2 = r \text{为相等实根，则通解为：}y = (C_1 + C_2x)e^{rx}\\
\text{如果}\alpha \pm \beta i \text{为一对共轭复根，则通解为：}y = e^{\alpha x}(C_1\cos\beta x + C_2\sin \beta x)
$$
欧拉方程：
$$
x^2\frac{d^2y}{dx^2} +px\frac{dy}{dx} +qy = f(x) ,\text{令} x = e^t \text{有：}\\
\frac{d^2y}{dt^2} + (p-1)\frac{dy}{dt} + qy = f(e^t),\text{解出后带回}lnx = t\text{即可。}
$$


### 无穷级数

研究下列级数的敛散性：
$$
\sum_{n = 2}^{\infty}\dfrac{(-1)^n}{\sqrt{n} + (-1)^n}
$$

<details class="answer-box">
<summary>点击展开答案</summary>

发散。

</details>


已知级数$\displaystyle\sum_{n= 1}^{\infty}(-1)^{n-1}u_n$ 条件收敛，$u_n > 0$ ，讨论级数$\displaystyle\sum_{n = 1}^{\infty}(u_{2n} - 2u_{2n-1})$的敛散性。


<details class="answer-box">
<summary>点击展开答案</summary>

发散。

</details>


$\displaystyle\sum_{n= 1}^{\infty}nu_n$绝对收敛， $\displaystyle\sum_{n= 1}^{\infty}\dfrac{v_n}{n}$条件收敛。讨论：$\displaystyle\sum_{n= 1}^{\infty}u_nv_n $ , $\displaystyle\sum_{n= 1}^{\infty}(u_n + v_n)$的敛散性。


<details class="answer-box">
<summary>点击展开答案</summary>

绝对收敛，不一定。

</details>


#### 幂级数

求幂级数$\displaystyle\sum_{n= 1}^{\infty}\dfrac{(-1)^{n-1}}{2n-1} x^{2n}$的和函数。

设数列$\{a_n\}$满足$a_1 = 1, (n + 1)a_{n+1} = (n + \frac{1}{2}) a_n\text{，求}\displaystyle\sum_{n= 1}^{\infty}a_nx^n$的和函数。



#### 必备的幂级数公式

$$
ln(1+x) = \displaystyle\sum_{n= 1}^{\infty}(-1)^{n-1}\dfrac{x^n}{n} ,\quad x\in (-1,1]\\
\dfrac{1}{2}ln(1+x) = \displaystyle\sum_{n= 1}^{\infty}(-1)^{n-1}\dfrac{x^n}{2n} ,\quad x\in (-1,1]\\
\arctan x = \displaystyle\sum_{n= 0}^{\infty}(-1)^{n}\dfrac{x^{2n+1}}{2n+1} ,\quad x\in [-1,1]\\
e^x = \displaystyle\sum_{n= 0}^{\infty}(-1)^{n}\dfrac{x^n}{n!}  ,\quad x\in (-\infty , \infty)\\
\dfrac{e^x + e^{-x}}{2} = \displaystyle\sum_{n= 0}^{\infty}\dfrac{x^{2n}}{(2n)!},\quad x\in (-\infty , \infty)\\
\cos x = \displaystyle\sum_{n = 0}^{\infty}(-1)^{n}\dfrac{x^{2n}}{(2n)!},\quad x\in (-\infty , \infty)\\
\dfrac{e^x - e^{-x}}{2} = \displaystyle\sum_{n= 0}^{\infty}\dfrac{x^{2n + 1}}{(2n + 1)!},\quad x\in (-\infty , \infty)\\
\sin x = \displaystyle\sum_{n = 0}^{\infty}(-1)^{n}\dfrac{x^{2n+1}}{(2n+1)!},\quad x\in (-\infty , \infty)\\
$$



### 以下为latex草稿区


$$
\text{形如} \dfrac{dy}{dx} = \varphi\left (\frac{y}{x} \right)  ,\text{令}u = \frac{y}{x}, then \quad \frac{du}{\varphi(u) - u} = \frac{dx}{x}
$$
i设$f(x)$为连续函数，则有
$$
\int_a^b f(x)dx = \int_a^bf(a + b - x)dx
$$
则若$f(x)$本身难求，则考虑
$$
\int_a^b f(x)dx = \int_a^b\frac{f(x) + f(a + b - x)}{2}dx
$$

$$
\int_0^{\frac{\pi}{2}}sin^nxdx = \int_0^{\frac{\pi}{2}}cos^nxdx = \frac{(n-1)!!}{n!!} \times \frac{\pi}{2}^{(n+1)\%2}
$$

三角有理式：万能公式代换

令$t = tan\dfrac{x}{2},sinx = \dfrac{2t}{1+t^2},cosx = \dfrac{1 - t^2}{1+t^2}$，则有
$$
\int R(sinx,cosx)dx = \int R\left (\frac{2t}{1+t^2},\frac{1 - t^2}{1+t^2}\right )\frac{2}{1+t^2}dt = \int \frac{P_n(t)}{Q_m(t)}dt
$$
形如：
$$
\int f(\sqrt[]{a^2 + x^2} )\stackrel{x = atant}{\longrightarrow}\text{有\text{理函数}}\\
\int f(\sqrt[]{\frac{ax+b}{cx+d} } )\stackrel{t = \sqrt[]{\frac{ax+b}{cx+d} } }{\longrightarrow}\text{有\text{理函数}}
$$


设二元函数为 $f(x, y)$，其一阶偏导数为：

**对 $x$ 的偏导数：**
$$
\frac{\partial f}{\partial x} = f_x = \lim_{h \to 0} \frac{f(x+h, y) - f(x, y)}{h}
$$

**对 $y$ 的偏导数：**
$$
\frac{\partial f}{\partial y} = f_y = \lim_{k \to 0} \frac{f(x, y+k) - f(x, y)}{k}
$$

二阶偏导数

**纯二阶偏导数：**
$$
\frac{\partial^2 f}{\partial x^2} = f_{xx} = \frac{\partial}{\partial x} \left( \frac{\partial f}{\partial x} \right)
$$

$$
\frac{\partial^2 f}{\partial y^2} = f_{yy} = \frac{\partial}{\partial y} \left( \frac{\partial f}{\partial y} \right)
$$

**混合偏导数：**
$$
\frac{\partial^2 f}{\partial x \partial y} = f_{xy} = \frac{\partial}{\partial y} \left( \frac{\partial f}{\partial x} \right)
$$

$$
\frac{\partial^2 f}{\partial y \partial x} = f_{yx} = \frac{\partial}{\partial x} \left( \frac{\partial f}{\partial y} \right)
$$

##### 重要定理（克莱罗定理）
如果 $f_{xy}$ 和 $f_{yx}$ 在点 $(x_0, y_0)$ 处连续，则：
$$
f_{xy}(x_0, y_0) = f_{yx}(x_0, y_0)
$$

$$
ln\left( 1 + \frac{1}{x}\right) = ln\left(\frac{1 + x}{x}\right) = ln(1+x )- ln(x) = (ln(x))'|_{x=\xi}(x + 1 - x) = \frac{1}{\xi}, \\
x < \xi < x+1 \text{，则有}\frac{1}{x+1} < \frac{1}{\xi} < \frac{1}{x}
$$


$$
\int_a^b f(x)dx = \lim\limits_{\lambda \to 0}\sum_{k = 1}^nf(\xi_k)\Delta x_k\\
\int_a^bf(x)dx = \lim\limits_{n \to \infty}\sum_{i = 1}^nf\left(a + \frac{b-a}{n}i\right)\frac{b-a}{n}\\
\int_0^1f(x)dx = \lim\limits_{n \to \infty}\sum_{i = 1}^nf\left(\frac{i}{n}\right)\frac{1}{n}
$$


$$
\int_0^1 \frac{1}{x^p} dx = 
\begin{cases}
  \text{收\text{敛}} , &0 < p < 1 \\
  \text{发\text{散}}, & p \ge 1
\end{cases}\quad \quad
\int_1^{\infty} \frac{1}{x^p} dx = 
\begin{cases}
  \text{发\text{散}} , &0 < p < 1 \\
  \text{收\text{敛}}, & p \ge 1
\end{cases}
$$

$$
\int_0^1 \frac{lnx }{x^p} dx = 
\begin{cases}
  \text{收\text{敛}} , &0 < p < 1 \\
  \text{发\text{散}}, & p \ge 1
\end{cases}\quad \quad
\int_1^{\infty} \frac{lnx}{x^p} dx = 
\begin{cases}
  \text{发\text{散}} , &0 < p < 1 \\
  \text{收\text{敛}}, & p \ge 1
\end{cases}
$$
设$f(x)$在$x_0$处连续，且$f(x_0)>0$,则存在$\delta$使得当 $|x-x_0|<\delta $ 时有 $f(x)>0$

1. 设$f(x)\to A(x\to x_0)$，且$A>0$,则存在$\delta$使得当 $|x-x_0|<\delta $ 时有 $f(x)>0$。

2. 若在$x_0$去心邻域内 $f(x) \ge 0$且$\lim\limits_{x \to x_0} f(x) = A$，则$A\ge 0$

1. $\lim \frac{\alpha(x)}{\beta(x)} = 0$ ，分子是分母的高阶无穷小
2. $\lim \frac{\alpha(x)}{\beta(x)} = \infty$，分子是分母的低阶无穷小
3. $\lim \frac{\alpha(x)}{\beta(x)} = c \neq 0$ ，分子是分母的同阶无穷小
4. $\lim \frac{\alpha(x)}{\beta(x)} = 1$，分子是分母的等价无穷小



洛必达法则：

1. 若 $\lim\limits_{x \to x_0} f(x) = \lim\limits_{x \to x_0} g(x) = 0$ 且 $\lim\limits_{x \to x_0} \dfrac{f'(x)}{g'(x)} = L$，则 $\lim\limits_{x \to x_0} \dfrac{f(x)}{g(x)} = L$；
2. 若 $\lim\limits_{x \to x_0} |f(x)| = \lim\limits_{x \to x_0} |g(x)| = \infty$ 且 $\lim\limits_{x \to x_0} \dfrac{f'(x)}{g'(x)} = L$，则 $\lim\limits_{x \to x_0} \dfrac{f(x)}{g(x)} = L$。

$$
\lim_{x \to 0} \frac{sinx}{x} = 1, \lim_{x \to \infty}\left ( 1+ \frac{1}{x} \right )^x= e
$$

1. $\frac{0}{0},\frac{\infty}{\infty}$ :先进行恒等变换，遇到幂指函数，一定用e抬升；泰勒公式也是一个非常好的办法。

2. $0\cdot\infty$ : 思路（1）把其中一个变换到分母上，变成第一种情况里的两种类型。（2）用夹逼准则试试。
3. $\infty - \infty$：有分母的话考虑通分（将减法变成乘除运算再用其他方法），没有分母的话考虑提公因式或者做倒数造出分母。
4. ${\infty}^0,{0}^0$:正经幂指函数，采用e抬升来做，化成第1、2种情况。
5. ${1}^{\infty}$：用好极限公式: $lim u^v = e^{limv(u-1)}$。证明使用<u>**两个重要极限公式**</u>中的第二个。



|                 未定型                 |                           处理思路                           |
| :------------------------------------: | :----------------------------------------------------------: |
| $\dfrac{0}{0}, \dfrac{\infty}{\infty}$ | 先进行恒等变换；遇到幂指函数时用 $e$ 抬升；泰勒展开也是很好的办法。 |
|            $0 \cdot \infty$            | ① 把其中一个变到分母上，化为 $\dfrac{0}{0}$ 或 $\dfrac{\infty}{\infty}$；② 尝试用夹逼准则。 |
|           $\infty - \infty$            | 有分母时考虑通分（将减法转为分式再处理）；无分母时考虑提公因式或取倒数造分母。 |
|            $\infty^0, 0^0$             |      属于幂指函数，采用 $e$ 抬升法，转化为前两种情况。       |
|               $1^\infty$               | 使用极限公式 $\lim u^v = e^{\lim v(u-1)}$；证明用 **两个重要极限公式** 的第二个。 |



| 函数           | 展开式（在 $x \to 0$）                                       |
| -------------- | ------------------------------------------------------------ |
| $e^x$          | $1 + x + \dfrac{x^2}{2} + \dfrac{x^3}{6} + o(x^3)$           |
| $\ln(1+x)$     | $x - \dfrac{x^2}{2} + \dfrac{x^3}{3} + o(x^3)$               |
| $(1+x)^\alpha$ | $1 + \alpha x + \dfrac{\alpha(\alpha-1)}{2}x^2 + \dfrac{\alpha(\alpha-1)(\alpha-2)}{6}x^3 + o(x^3)$ |
| $\sin x$       | $x - \dfrac{x^3}{6} + o(x^3)$                                |
| $\cos x$       | $1 - \dfrac{x^2}{2} + o(x^3)$                                |
| $\tan x$       | $x + \dfrac{x^3}{3} + o(x^3)$                                |
| $\arcsin x$    | $x + \dfrac{x^3}{6} + o(x^3)$                                |
| $\arctan x$    | $x - \dfrac{x^3}{3} + o(x^3)$                                |