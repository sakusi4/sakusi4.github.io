---
layout: post
title: "C/C++, 헤더 파일 중복 방지와 전역 변수"
category: c_cpp
date: 2021-03-08
---

헤더 파일이 여러번 정의되는 것을 막기 위해 조건부 컴파일이나 #pragma once를 사용합니다.
아래 예제를 봅시다.

{% highlight c linenos=table %}
//global.h
#ifndef GLOBAL_H
#define GLOBAL_H

int num;

#endif

//main.c
#include "global.h"

int main()
{
    return 0;
}

//func.c
#include "global.h"
{% endhighlight %}

빌드를 시도하면 중복 정의로 인한 링커 에러가 납니다. 
이유는 간단합니다. 소스 파일 단위로 컴파일을 하기 때문이죠. 이 방법을 사용하면 각 소스 파일에는 절대 중복 헤더가 생기지 않습니다. 하지만 링커에서 합치려고 하면 문제가 생기게 됩니다.

어쨌든 이제 전역 변수는 안되는 이유를 알았습니다. 그렇다면 함수의 선언은 괜찮을까요? 네 괜찮습니다. 중요한 건 정의입니다. 'int num;'은 선언처럼 보이지만 전역 변수이므로 프로그램 시작 시 초깃값이 할당되므로 정의입니다. 

그렇기 때문에 헤더 파일에 전역 변수를 넣고 싶다면 선언의 형태로 넣어야 합니다. 그래야만 중복이 돼도 문제가 안 생깁니다. 이 방법은 간단합니다. extern 키워드를 사용합니다. extern 키워드는 프로토타입을 알리는 용도이므로 메모리에 실제 할당하지 않습니다. 대신 어딘가에서 정의는 해줘야 합니다. 

{% highlight c linenos=table %}
//global.h
#ifndef GLOBAL_H
#define GLOBAL_H

extern int num;

#endif

//main.c
#include "global.h"
extern void print_num();

int num = 0;
int main()
{    
    printf("%d\n", num); // output 0
    num = 10;
    print_num(); // output 10
    
    return 0;
}

//func.c
#include "global.h"
void print_num()
{
    printf("%d\n", num);
}
{% endhighlight %}

이렇게 하면 됩니다. 정의는 어디서든 최소 한 번 이상 해줘야만 합니다. 


