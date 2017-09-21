using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using DG.Tweening;
using UnityEngine.AI;
public class Enemy : MonoBehaviour {
	public float fSpeed;
	int iCurPathIdx = 0;
	Sequence seqUpDownSeq;


	public void slowDown(float percentage)
	{		
//		this.seqUpDownSeq.timeScale *= percentage;
		NavMeshAgent agent = this.GetComponent<NavMeshAgent> ();
		agent.speed *= percentage;
	}

	void Start ()
	{
//		Transform body = transform.Find("body");
//		float yy = transform.position.y;
//		this.seqUpDownSeq = DOTween.Sequence();
//		this.seqUpDownSeq.SetLoops (-1);
//		this.seqUpDownSeq.Append (body.DOMoveY (yy + 0.2f, 0.4f));
//		this.seqUpDownSeq.Append (body.DOMoveY (yy, 0.4f));

		this.GetComponent<NavMeshAgent> ().isStopped = true;
		this.iCurPathIdx = 1;
		StartCoroutine (move ());

	}

	IEnumerator move()
	{
		NavMeshAgent agent = this.GetComponent<NavMeshAgent> ();
		agent.Resume ();
		agent.isStopped = false;
		agent.updateRotation = true;

		agent.SetDestination (GameScene.getInstance ().getPathPos (iCurPathIdx));
		yield return StartCoroutine (waifForDestination ());

		StartCoroutine (nextWayPoint ());
	}

	IEnumerator waifForDestination()
	{
		NavMeshAgent agent = this.GetComponent<NavMeshAgent> ();
		yield return new WaitForEndOfFrame ();
		while (agent.pathPending)
			yield return null;
		yield return new WaitForEndOfFrame ();
	
		while (agent.remainingDistance > 0.02f) 
		{
			yield return null;
		}
	}

	IEnumerator nextWayPoint()
	{
		iCurPathIdx++;
		iCurPathIdx %= GameScene.getInstance ().getPathPointCnt ();
		NavMeshAgent agent = this.GetComponent<NavMeshAgent> ();
		agent.SetDestination (GameScene.getInstance ().getPathPos (iCurPathIdx));
		yield return StartCoroutine (waifForDestination ());

		StartCoroutine (nextWayPoint ());
	}

}

