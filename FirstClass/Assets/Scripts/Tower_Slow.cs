using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using DG.Tweening;

public class Tower_Slow : Tower {

	// Use this for initialization
	int iSlowPercentage = 30;
	void Start()
	{
		this.init ();
	}
	void Update()
	{
	}

	void removeEffect(Enemy en)
	{
//		en.fSpeed /= (0.01f * iSlowPercentage);
		en.slowDown(1/(0.01f*(100 - iSlowPercentage)));
	}
	void attack(Enemy en)
	{
//		en.fSpeed *= (0.01f * iSlowPercentage);
		en.slowDown(0.01f*(100 - iSlowPercentage));
	}

	protected virtual void OnTriggerEnter(Collider col){
		Enemy en = col.gameObject.GetComponent<Enemy> ();
		this.listEnemys.Add (en);
		attack (en);
	}

	protected virtual void OnTriggerExit(Collider col)
	{
		Debug.Log ("exit");
		Enemy en = col.gameObject.GetComponent<Enemy> ();
		this.listEnemys.Remove (en);
		removeEffect(en);
		
	}
}
