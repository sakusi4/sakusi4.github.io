---
title: "C - Call-by-Reference는 없다."
categories: 
  - C

date: 2018-09-08 16:30:16
toc: true
---
값을 넘기면 Call by Value

주소를 넘기면 Call by reference

조금만 공부했다면 모두 다 아는 내용이다. Call by Reference는 주로 전역 변수 없이 다른 함수에서 값을 조작해야 할 때 사용된다. 근데 태클을 걸고 싶다. '전부 다 Call by Value 아냐?'라고 말이다.
분명히 해두고 싶은 것은 목적이 다르기 때문에 의미를 나눈 것은 좋으나 그로 인해서 이 둘을 완전히 별개로 인식하는 것은 문제가 있다. 문법적으로 나눠져있지 않기 때문이다.

{% highlight cpp %}
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

일반적인 값에 의한 호출 예제다. 출력 결과는 당연히 1이다. function에서의 조작은 main 함수의 a와 별개로 적용되기 때문에 아무런 의미가 없다.

{% highlight cpp %}
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

이제 출력 결과는 3이다. function 함수로 주소를 전달했고, 그 주소에 접근해 값을 수정했기 때문에 함수가 반환돼도 유효하다. 그럼 이 둘은 별개의 문법인가? 그건 아니다. 두 개의 예제 모두 똑같은 방식으로 실행됐다. 다만 포인터는 값을 주솟값으로 가진다는 게 달랐을 뿐이다. 주솟값도 값이라는 게 중요하다. 단지 값이다. 확인해보자.

{% highlight cpp %}
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

이번에는 포인터를 전달하지 않았다. main 함수의 pa와 pb는 정수형 변수다. function에서 받을 때도 마찬가지로 정수형 변수 두 개를 받는다. 하지만 실행 결과는 당연히 3이다. 
누군가는 당연한 것 아니야?라고 할 수 있지만 생각보다 많은 사람이 변수를 던지면 값에 의한 호출, 포인터를 던지면 참조에 의한 호출이라고 생각하는 사람이 많다.