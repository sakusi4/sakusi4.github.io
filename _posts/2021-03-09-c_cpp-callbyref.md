---
layout: post
title: "C/C++, Call-by-Reference는 없다."
category: c_cpp
date: 2019-02-04
---

보통은 값을 넘기는 Call by value, 주소를 넘기면 Call by Reference라고 생각합니다.
사실 이 표현은 좀 모호한 구석이 있습니다. 실제로는 모두 Call by Value로 동작하기 때문입니다.

아래 예제를 봅시다.
{% highlight c linenos=table %}
void function(int a, int b)
{
	a = a + b;
}

int main()
{
	int a = 1;
	int b = 2;

	function(a, b);

	cout << a << endl;

	return 0;
}
{% endhighlight %}

일반적인 Call by value 예제입니다. function() 함수에서의 조작이 main() 함수에 영향을 끼치지 못합니다.

{% highlight c linenos=table %}
void function(int *a, int *b)
{
	*a = *a + *b;
}

int main()
{
	int a = 1;
	int b = 2;

	function(&a, &b);

	cout << a << endl;

	return 0;
}
{% endhighlight %}

주소를 넘기는 예제입니다. 이 경우는 main 함수의 a, b값이 바뀝니다. 다음 예제는 좀 재밌습니다.
{% highlight c linenos=table %}
void function(int a, int b)
{
	*(int*)a = *(int*)a + *(int*)b;
}

int main()
{
	int a = 1;
	int b = 2;
	int pa = (int)& a;
	int pb = (int)& b;

	function(pa, pb);

	cout << a << endl;

	return 0;
}
{% endhighlight %}

이 상황은 값을 넘긴 걸까요? 주소를 넘긴 걸까요? 이 둘은 반대되는 개념이 아닙니다. 지금은 주소인 값이 복사된 겁니다. 두 번째 예제도 마찬가지입니다. 주소인 값이 복사된 것입니다. 값으로 무엇을 가지고 있느냐가 중요한 것이죠.
