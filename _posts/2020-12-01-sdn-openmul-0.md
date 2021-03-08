---
layout: post
title: "OpenMUL, 설치 및 예제 실행"
category: sdn
date: 2020-12-04
---
OpenMUL은 C로 작성된 SDN Controller로 생각보다 많이 사용되고 있는 것 같습니다.
꽤 오래전에 만들어진 프로젝트라 최신 버전 리눅스에선 빌드하는 데 문제가 있을 수 있습니다.
저는 Mininet에서 제공하는 VM이미지(Ubuntu 14.04)에서 설치했습니다. 

그럼 설치를 시작해봅시다.
{% highlight c linenos=table %}
~ # git clone https://github.com/openmul/openmul.git
~ # cd openmul
{% endhighlight %}

저의 경우에는 pip 설치 문제로 빌드가 되지 않았습니다. 잘못하면 의존성이 꼬여서 귀찮아질 수 있으니 먼저 예방합시다.
build.sh를 열어서 조금 수정을 해야 합니다.

{% highlight python %}
99:  #$install python-pip
100: #sudo -H pip install --upgrade pip
101:
102: #sudo -H pip install -r python_req.txt
{% endhighlight %}

위와 같이 99~102줄을 주석처리 하고 ./buiild.sh를 입력하면 빌드가 될 겁니다. 
pip 관련 에러가 계속 난다면 아래 명령어를 수행한 다음, 다시 build.sh를 실행해보세요.

{% highlight python linenos=table %}
sudo apt-get purge python-pip
sudo apt-get autoremove
{% endhighlight %}

컨트롤러와 미니넷은 각각 다른 창에서 실행하는 것이 편리합니다. 아래 예제에선 컨트롤러를 먼저 실행하지만 미니넷을 먼저 실행해도 상관없습니다.

{% highlight c linenos=table %}
첫 번째 창에서
~/openmul # ./mul.sh start l2switch

두 번째 창에서
~/openmul # sudo mn --topo single,3 --mac --switch ovsk --controller remote
mininet> h1 ping h2
{% endhighlight %}

다음 포스팅에서 자신의 애플리케이션을 개발해서 실행하는 방법을 다뤄보겠습니다.실행하는 방법을 다뤄보겠습니다.